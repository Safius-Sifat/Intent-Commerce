from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/query")
async def nl_analytics_query():
    raise HTTPException(status_code=501, detail="NL analytics pending")


@router.get("/forecast/{product_id}")
async def get_forecast(product_id: str):
    raise HTTPException(status_code=501, detail="Forecasting pending")


@router.get("/dashboard")
async def dashboard_metrics():
    return {"metrics": []}
