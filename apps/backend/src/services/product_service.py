from sqlalchemy.ext.asyncio import AsyncSession


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_products(self, query: str, filters: dict | None = None):
        # TODO: integrate hybrid RAG retrieval
        return []

    async def get_product_by_id(self, product_id: str):
        # TODO: fetch from DB with variants
        return None

    async def create_product(self, vendor_id: str, data: dict):
        # TODO: insert product, queue embedding job
        return None
