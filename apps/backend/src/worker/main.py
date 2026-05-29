"""
Celery Worker for background jobs

Tasks:
- generate_product_embeddings: on product upload
- process_inventory_alert: low stock notifications
- refresh_forecast: periodic model retraining
"""

from celery import Celery
from src.config import settings

celery_app = Celery(
    "intent_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["src.worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# TODO: define tasks in src/worker/tasks.py
