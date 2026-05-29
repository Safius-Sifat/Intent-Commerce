# Specification: Product Catalog System

## Overview

The product catalog is the foundation of the marketplace. Vendors create and manage products; shoppers browse and discover them. Products support variants (e.g., size, color), images, and flexible attributes. All active products are indexed in Qdrant for AI-powered retrieval.

## Data Model

### Product

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| vendor_id | UUID | FK → vendors.id, indexed | Owner |
| title | VARCHAR(500) | NOT NULL | Product name |
| description | TEXT | NULL | Full description |
| price | NUMERIC(10,2) | NOT NULL | Base price |
| compare_at_price | NUMERIC(10,2) | NULL | Original price (for sales display) |
| category | VARCHAR(100) | NULL, indexed | Top-level category |
| subcategory | VARCHAR(100) | NULL | Sub-category |
| tags | VARCHAR[] | DEFAULT [] | Searchable keywords |
| brand | VARCHAR(100) | NULL | Brand name |
| sku | VARCHAR(100) | NULL | Vendor's SKU |
| inventory_count | INTEGER | DEFAULT 0 | Total across all variants |
| status | VARCHAR(20) | DEFAULT 'draft', indexed | active, draft, archived |
| attributes | JSONB | NULL | Flexible specs (color, material, etc.) |
| images | JSONB | DEFAULT [] | Array of image metadata |
| text_embedding | VECTOR(1024) | NULL | BGE-M3 embedding |
| image_embedding | VECTOR(768) | NULL | SigLIP embedding (primary image) |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update |

### Product Image (stored in images JSONB)

```json
{
  "id": "img-uuid",
  "url": "https://cdn.example.com/products/img-uuid.jpg",
  "alt": "Red running shoes side view",
  "is_primary": true,
  "order": 0
}
```

### Product Variant

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| product_id | UUID | FK → products.id, indexed | Parent product |
| variant_name | VARCHAR(255) | NOT NULL | e.g., "Red / Size 10" |
| sku | VARCHAR(100) | NULL | Variant SKU |
| price_adjustment | NUMERIC(10,2) | DEFAULT 0 | Added to base price |
| inventory_count | INTEGER | DEFAULT 0 | Stock for this variant |
| attributes | JSONB | NULL | {color: "red", size: "10"} |

## Product Lifecycle

```
Draft → Active → Archived
   ↓      ↓         ↓
 Vendor  Visible   Hidden
 edits   in search  from all
         & catalog  queries
```

- **Draft**: Vendor is editing, not visible to shoppers
- **Active**: Visible in search and catalog
- **Archived**: Soft-deleted, hidden from all queries

## API Endpoints

### Vendor: Create Product

```
POST /api/v1/products
Authorization: Bearer <vendor_token>
Content-Type: multipart/form-data

Fields:
  title: "Nike Air Zoom Pegasus 40"
  description: "Comfortable running shoes for daily training..."
  price: 129.99
  compare_at_price: 149.99
  category: "footwear"
  subcategory: "running-shoes"
  tags: "running,shoes,nike,training"
  brand: "Nike"
  sku: "NK-AZP40-001"
  attributes: {"material": "mesh", "closure": "lace-up"}
  images[]: [File, File, File]
  variants: [
    {"variant_name": "Black / 9", "sku": "NK-AZP40-BLK-9", "price_adjustment": 0, "inventory_count": 15, "attributes": {"color": "black", "size": "9"}},
    {"variant_name": "Black / 10", "sku": "NK-AZP40-BLK-10", "price_adjustment": 0, "inventory_count": 12, "attributes": {"color": "black", "size": "10"}}
  ]

Response 201:
{
  "id": "prod-uuid",
  "title": "Nike Air Zoom Pegasus 40",
  "vendor_id": "vendor-uuid",
  "status": "draft",
  "images": [{"id": "img-1", "url": "...", "is_primary": true}],
  "variants": [...]
}
```

### Vendor: List Own Products

```
GET /api/v1/products?status=active&page=1&limit=20
Authorization: Bearer <vendor_token>

Response 200:
{
  "items": [...],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### Public: Browse Products

```
GET /api/v1/products?category=footwear&min_price=50&max_price=200&search=running&sort=price_asc&page=1&limit=20

Response 200:
{
  "items": [
    {
      "id": "prod-uuid",
      "title": "Nike Air Zoom Pegasus 40",
      "price": 129.99,
      "compare_at_price": 149.99,
      "category": "footwear",
      "vendor": {"id": "vendor-uuid", "business_name": "Sports Direct"},
      "images": [{"url": "...", "is_primary": true}],
      "inventory_status": "in_stock" // in_stock, low_stock, out_of_stock
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

### Public: Product Detail

```
GET /api/v1/products/{id}

Response 200:
{
  "id": "prod-uuid",
  "title": "Nike Air Zoom Pegasus 40",
  "description": "...",
  "price": 129.99,
  "compare_at_price": 149.99,
  "category": "footwear",
  "tags": ["running", "shoes", "nike"],
  "brand": "Nike",
  "vendor": {"id": "vendor-uuid", "business_name": "Sports Direct"},
  "images": [...],
  "variants": [...],
  "attributes": {...}
}
```

## Image Upload Pipeline

### Validation Rules

1. **Format**: JPG, PNG, WebP only (check magic bytes, not extension)
2. **Size**: Max 5MB per image
3. **Dimensions**: Min 500x500px, Max 4000x4000px
4. **Count**: Max 8 images per product
5. **First image** becomes primary (`is_primary: true`)

### Storage Flow

```
Frontend Upload
      ↓
Backend Validation (Pillow)
      ↓
Image Processing:
  - Original saved
  - Thumbnail generated (800px width)
      ↓
Storage:
  Dev: local filesystem (apps/backend/uploads/)
  Prod: S3/R2 bucket
      ↓
URL saved to products.images JSONB
      ↓
Celery Task Enqueued:
  - Generate text embedding (title + description + tags)
  - Generate image embedding (primary image)
  - Upsert to Qdrant
```

## Inventory Rules

1. **Product-level inventory**: Sum of all variant inventory counts
2. **Display logic**:
   - `inventory_count > 10`: Show "In Stock"
   - `1 <= inventory_count <= 10`: Show "Low Stock — Only X left"
   - `inventory_count == 0`: Show "Out of Stock" + disable Add to Cart
3. **Variant inventory**: When a variant is selected, show variant-specific stock
4. **Cart validation**: Cannot add more than available inventory

## Qdrant Indexing

### Collection: `products`

**Text Vectors**
- Size: 1024
- Distance: Cosine
- Source: BGE-M3(title + " " + description + " " + " ".join(tags))

**Image Vectors**
- Size: 768
- Distance: Cosine
- Source: SigLIP(primary product image)

**Payload Indexes**
- `vendor_id` — keyword
- `category` — keyword
- `status` — keyword
- `price` — float
- `tags` — keyword (array)

### Upsert Format

```python
{
    "id": str(product.id),
    "vector": {
        "text": text_embedding,      # 1024-dim
        "image": image_embedding     # 768-dim
    },
    "payload": {
        "vendor_id": str(vendor_id),
        "category": category,
        "price": float(price),
        "status": status,
        "tags": tags,
        "title": title
    }
}
```

## Implementation Checklist

- [ ] Product and ProductVariant SQLAlchemy models
- [ ] Alembic migration for products and variants
- [ ] `POST /products` endpoint (multipart, vendor-only)
- [ ] `GET /products` endpoint (public, with filters)
- [ ] `GET /products/{id}` endpoint (public)
- [ ] `PUT /products/{id}` endpoint (vendor-only, owner check)
- [ ] `DELETE /products/{id}` endpoint (soft delete)
- [ ] Image upload validation (format, size, dimensions)
- [ ] Image storage abstraction (local dev / S3 prod)
- [ ] Thumbnail generation
- [ ] Celery task for embedding generation on upload
- [ ] Qdrant upsert in embedding task
- [ ] Frontend product upload form with drag-and-drop
- [ ] Frontend product catalog browser with filters
- [ ] Frontend product detail page with image gallery
- [ ] Variant selector in product detail
- [ ] Inventory status display logic

## Testing Scenarios

1. Vendor creates product with 3 images → images uploaded, URLs correct
2. Vendor creates product with variants → variants saved, inventory correct
3. Public browses products → only active products shown
4. Public filters by category + price → correct subset returned
5. Vendor updates product title → embedding regeneration queued
6. Vendor deletes product → product archived, no longer in search
7. Upload invalid file type (PDF) → rejected with 422
8. Upload oversized image (>5MB) → rejected with 422
9. Search returns products → Qdrant index verified
