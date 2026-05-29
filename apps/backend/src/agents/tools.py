"""
Agent Tools

These are the functions the LangGraph agent can call.
They live in the service layer and are imported by the agent.
Services must NEVER import the agent layer.
"""

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.services.product_service import ProductService
from src.services.order_service import OrderService


def get_tools(db: AsyncSession) -> list[dict[str, Any]]:
    product_service = ProductService(db)
    order_service = OrderService(db)

    tools = [
        {
            "name": "search_products",
            "description": "Search for products in the marketplace using natural language.",
            "func": product_service.search_products,
            "parameters": {
                "query": "string (natural language search query)",
                "filters": "optional dict with category, price_min, price_max, vendor_id",
            },
        },
        {
            "name": "get_product_details",
            "description": "Get detailed information about a specific product.",
            "func": product_service.get_product_by_id,
            "parameters": {
                "product_id": "string (UUID of the product)",
            },
        },
        {
            "name": "check_inventory",
            "description": "Check real-time inventory for a product or variant.",
            "func": lambda product_id, variant_id=None: {"available": True, "qty": 10},
            "parameters": {
                "product_id": "string",
                "variant_id": "optional string",
            },
        },
        {
            "name": "add_to_cart",
            "description": "Add a product to the user's shopping cart.",
            "func": order_service.add_to_cart,
            "parameters": {
                "user_id": "string",
                "product_id": "string",
                "quantity": "integer",
                "variant_id": "optional string",
            },
        },
        {
            "name": "get_cart",
            "description": "Retrieve the user's current shopping cart.",
            "func": order_service.get_cart,
            "parameters": {
                "user_id": "string",
            },
        },
        {
            "name": "remove_from_cart",
            "description": "Remove an item from the user's cart.",
            "func": order_service.remove_from_cart,
            "parameters": {
                "user_id": "string",
                "cart_item_id": "string",
            },
        },
        {
            "name": "get_user_addresses",
            "description": "Get saved shipping addresses for the user.",
            "func": lambda user_id: [],
            "parameters": {"user_id": "string"},
        },
        {
            "name": "initiate_checkout",
            "description": "Create an order draft and prepare payment.",
            "func": order_service.create_order,
            "parameters": {
                "user_id": "string",
                "address_id": "string",
                "payment_method_id": "string",
            },
        },
        {
            "name": "confirm_payment",
            "description": "Finalize order after user explicitly confirms payment.",
            "func": order_service.confirm_payment,
            "parameters": {
                "order_id": "string",
                "payment_token": "string",
            },
        },
    ]

    return tools
