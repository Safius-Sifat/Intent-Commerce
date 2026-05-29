from sqlalchemy.ext.asyncio import AsyncSession


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_cart(self, user_id: str):
        # TODO: query cart_items with product details
        return {"items": [], "total": 0}

    async def add_to_cart(self, user_id: str, product_id: str, quantity: int, variant_id: str | None = None):
        # TODO: validate stock, insert/update cart_items
        return None

    async def remove_from_cart(self, user_id: str, cart_item_id: str):
        # TODO: delete cart item
        return None

    async def create_order(self, user_id: str, address_id: str, payment_method_id: str):
        # TODO: create order draft, hold inventory, call Stripe
        return None

    async def confirm_payment(self, order_id: str, payment_token: str):
        # TODO: verify Stripe payment, confirm order
        return None
