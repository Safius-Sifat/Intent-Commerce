from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/cart")
async def get_cart():
    return {"items": [], "total": 0}


@router.post("/cart/items")
async def add_to_cart():
    raise HTTPException(status_code=501, detail="Add to cart pending")


@router.delete("/cart/items/{item_id}")
async def remove_from_cart(item_id: str):
    raise HTTPException(status_code=501, detail="Remove from cart pending")


@router.post("/")
async def create_order():
    raise HTTPException(status_code=501, detail="Order creation pending")


@router.get("/")
async def list_orders():
    return {"orders": []}
