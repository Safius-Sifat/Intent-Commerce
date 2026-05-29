from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/register")
async def register():
    raise HTTPException(status_code=501, detail="Auth registration pending implementation")


@router.post("/login")
async def login():
    raise HTTPException(status_code=501, detail="Auth login pending implementation")


@router.get("/me")
async def me():
    raise HTTPException(status_code=501, detail="Auth me pending implementation")
