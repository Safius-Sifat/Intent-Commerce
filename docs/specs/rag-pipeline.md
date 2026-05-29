# Specification: Hybrid RAG Pipeline

## Overview

The RAG (Retrieval-Augmented Generation) pipeline powers product discovery in the chat interface. It uses a **hybrid multimodal** approach: combining dense semantic search (BGE-M3), sparse keyword search (SPLADE), and image similarity (SigLIP) to find the most relevant products for any user query.

## Architecture

```
User Query (Text + Optional Image)
        ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Dense Search   │  │  Sparse Search  │  │  Image Search   │
│  (BGE-M3)       │  │  (BM25/SPLADE)  │  │  (SigLIP)       │
│  Semantic       │  │  Keyword        │  │  Visual         │
│  Meaning        │  │  Matching       │  │  Similarity     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ↓
                    Reciprocal Rank Fusion (RRF)
                              ↓
                    Cross-Encoder Re-ranking (Optional)
                              ↓
                    Final Top-K Results
                              ↓
                    Agent Response Generation
```

## Embedding Models

### Text: BGE-M3 (BAAI/bge-m3)

- **Type**: Dense + Sparse dual encoder
- **Dimensions**: 1024 (dense)
- **Use case**: Semantic understanding of product descriptions and user queries
- **Example**:
  - Query: "comfortable shoes for long distance running"
  - Matches: "Nike Air Zoom marathon trainers" (semantic match even without exact keyword overlap)

### Image: SigLIP (google/siglip-so400m-patch14-384)

- **Type**: Vision-language encoder
- **Dimensions**: 768
- **Use case**: Visual similarity search
- **Example**:
  - User uploads photo of a red dress
  - Finds products with similar color, cut, and style

## Hybrid Retrieval Steps

### Step 1: Dense Retrieval (Semantic)

```python
query_embedding = bge_m3.encode(query_text)  # 1024-dim

results_dense = qdrant.search(
    collection_name="products",
    query_vector=("text", query_embedding),
    query_filter=models.Filter(
        must=[
            models.FieldCondition(key="status", match=models.MatchValue(value="active")),
        ]
    ),
    limit=50
)
```

### Step 2: Sparse Retrieval (Keyword)

For keyword-heavy queries (brand names, SKUs, exact terms):

```python
# Option A: Qdrant sparse vectors (if using SPLADE)
results_sparse = qdrant.search(
    collection_name="products",
    query_vector=("sparse", sparse_query_vector),
    limit=50
)

# Option B: PostgreSQL full-text search (fallback)
# tsvector on products.title, description, tags, brand
```

### Step 3: Image Retrieval (Visual)

```python
if image_query:
    image_embedding = siglip.encode(image_query)  # 768-dim
    
    results_image = qdrant.search(
        collection_name="products",
        query_vector=("image", image_embedding),
        limit=50
    )
```

### Step 4: Reciprocal Rank Fusion (RRF)

```python
def reciprocal_rank_fusion(results_lists, k=60):
    """
    Merge multiple ranked lists into a single ranked list.
    k: smoothing parameter (default 60)
    """
    scores = {}
    
    for results in results_lists:
        for rank, item in enumerate(results):
            if item.id not in scores:
                scores[item.id] = 0
            scores[item.id] += 1 / (k + rank + 1)
    
    # Sort by score descending
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return ranked
```

### Step 5: Cross-Encoder Re-ranking (Optional, for latency < 3s)

```python
# Take top 20 from RRF, re-rank with cross-encoder
cross_encoder = CrossEncoder('BAAI/bge-reranker-v2-m3')

pairs = [(query_text, result.payload['title'] + " " + result.payload.get('description', '')) 
         for result in top_20]

scores = cross_encoder.predict(pairs)
# Sort by cross-encoder score
```

## Qdrant Collection Configuration

```python
from qdrant_client.models import VectorParams, Distance

client.create_collection(
    collection_name="products",
    vectors_config={
        "text": VectorParams(size=1024, distance=Distance.COSINE),
        "image": VectorParams(size=768, distance=Distance.COSINE),
    },
    sparse_vectors_config={
        "sparse_text": SparseVectorParams(index=SparseIndexParams(on_disk=False))
    } if using_splade else None
)

# Payload indexes
client.create_payload_index("products", "vendor_id", "keyword")
client.create_payload_index("products", "category", "keyword")
client.create_payload_index("products", "status", "keyword")
client.create_payload_index("products", "price", "float")
```

## Filtering & Pre-filtering

Always apply these filters before vector search:

1. **Status**: `status = "active"`
2. **Inventory**: `inventory_count > 0` (or check after retrieval)
3. **Price range**: If user mentions budget
4. **Category**: If user specifies category
5. **Vendor**: If user wants a specific store

```python
query_filter = models.Filter(
    must=[
        models.FieldCondition(key="status", match=models.MatchValue(value="active")),
    ],
    should=[
        models.FieldCondition(key="category", match=models.MatchValue(value=category)),
    ]
)
```

## Result Format for Agent

```python
{
    "products": [
        {
            "id": "prod-uuid",
            "title": "Nike Air Zoom Pegasus 40",
            "price": 129.99,
            "vendor_name": "Sports Direct",
            "image_url": "...",
            "relevance_score": 0.92,
            "match_type": "dense"  # or "sparse", "image", "fused"
        }
    ],
    "total_found": 15,
    "query_understanding": {
        "intent": "product_search",
        "category": "footwear",
        "price_range": {"min": 50, "max": 150},
        "attributes": {"activity": "running"}
    }
}
```

## Failure Modes & Handling

| Scenario | Behavior |
|----------|----------|
| No exact matches | Return top-K similar + agent says "I couldn't find exactly that, but here are close matches..." |
| All results out of stock | Agent checks inventory, says "These are similar but currently unavailable. Here are in-stock alternatives..." |
| Image upload fails | Fall back to text-only search + agent apologizes |
| Qdrant is down | Fall back to PostgreSQL ILIKE search |
| Query is ambiguous | Agent asks clarifying questions |

## Performance Targets

| Metric | Target |
|--------|--------|
| Dense retrieval latency | < 100ms |
| Sparse retrieval latency | < 50ms |
| Image retrieval latency | < 150ms |
| RRF merge latency | < 10ms |
| Total retrieval + re-ranking | < 500ms |
| End-to-end (query → agent response) | < 2s |

## Implementation Checklist

- [ ] Install and test BGE-M3 locally
- [ ] Install and test SigLIP locally
- [ ] Create Qdrant `products` collection with dual vector config
- [ ] Implement `generate_text_embedding()` function
- [ ] Implement `generate_image_embedding()` function
- [ ] Implement dense retrieval function
- [ ] Implement sparse retrieval function (BM25 or SPLADE)
- [ ] Implement image retrieval function
- [ ] Implement RRF merge function
- [ ] Implement optional cross-encoder re-ranking
- [ ] Add pre-filtering (status, inventory, price, category)
- [ ] Handle edge cases (no matches, all OOS, ambiguous queries)
- [ ] Add fallback to PostgreSQL if Qdrant is unavailable
- [ ] Performance benchmark: measure retrieval latency
- [ ] Integration with LangGraph agent (pass results to agent state)

## Testing Scenarios

1. **Semantic search**: "comfy shoes for jogging" → finds "Nike Air Zoom" without exact keyword match
2. **Keyword search**: "Nike Pegasus" → finds exact brand + model
3. **Image search**: Upload photo of red dress → finds similar red dresses
4. **Hybrid**: "red running shoes like this [image]" → combines text + image
5. **Filtering**: "shoes under $50" → only returns products with price <= 50
6. **No matches**: "spaceship parts" → returns nothing, agent handles gracefully
7. **Stockout handling**: Top result is OOS → agent informs user and shows alternatives
8. **Qdrant downtime**: System falls back to PostgreSQL search
