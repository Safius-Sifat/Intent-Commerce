from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()


@router.get("/")
async def list_products():
    return {"items": [], "total": 0}


@router.get("/{product_id}")
async def get_product(product_id: str):
    raise HTTPException(status_code=501, detail="Product detail pending")


@router.post("/")
async def create_product(
    title: str,
    description: str | None = None,
    price: float = 0.0,
    images: list[UploadFile] = File(default_factory=list),
):
    raise HTTPException(status_code=501, detail="Product creation pending")
