"""
Multimodal Embedding Pipeline

- Text: BGE-M3 (dense + sparse)
- Image: SigLIP
- Fused and stored in Qdrant
"""

from typing import Any

from qdrant_client import AsyncQdrantClient

from src.config import settings

COLLECTION_NAME = "products"


class EmbeddingPipeline:
    def __init__(self):
        self.qdrant: AsyncQdrantClient | None = None

    async def connect(self):
        self.qdrant = AsyncQdrantClient(url=settings.QDRANT_URL)

    async def ensure_collection(self):
        # TODO: create Qdrant collection with proper vector configs
        pass

    async def generate_text_embedding(self, text: str) -> list[float]:
        # TODO: load BGE-M3, return dense vector
        return [0.0] * 1024

    async def generate_image_embedding(self, image_url: str) -> list[float]:
        # TODO: load SigLIP, return image vector
        return [0.0] * 768

    async def index_product(self, product_id: str, text_vector: list[float], image_vector: list[float] | None, metadata: dict[str, Any]):
        # TODO: upsert into Qdrant
        pass

    async def search_hybrid(self, text_query: str, image_query: str | None = None, filters: dict[str, Any] | None = None, top_k: int = 10) -> list[dict[str, Any]]:
        # TODO: dense + sparse + multimodal fusion + RRF
        return []


pipeline = EmbeddingPipeline()
