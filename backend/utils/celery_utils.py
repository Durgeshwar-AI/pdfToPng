from celery import Celery
import os

def make_celery(app_name=__name__):
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    return Celery(
        app_name,
        broker=redis_url,
        backend=redis_url,
        include=['blueprints.tasks'] # We will put our tasks here
    )

celery = make_celery()
