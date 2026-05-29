from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/")
async def send_message():
    raise HTTPException(status_code=501, detail="Chat endpoint pending implementation")


@router.get("/history")
async def get_history():
    return {"messages": []}
