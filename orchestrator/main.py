from fastapi import FastAPI
from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title="ecobrief orchestrator",
    description="coordinates inference lifecycle and s3 asset retrieval",
    version="0.1.0"
)

app.include_router(router, prefix="/api/v1")
