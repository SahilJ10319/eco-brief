from fastapi import APIRouter, HTTPException, Depends
from botocore.exceptions import ClientError
from app.core.aws import get_s3_client
from app.core.config import settings
from typing import Any

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/payloads")
def list_payloads(s3=Depends(get_s3_client)) -> list[dict[str, Any]]:
    try:
        response = s3.list_objects_v2(
            Bucket=settings.s3_bucket_name,
            Prefix="raw/"
        )
        objects = response.get("Contents", [])
        return [{"key": obj["Key"], "size": obj["Size"], "last_modified": str(obj["LastModified"])} for obj in objects]
    except ClientError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/payloads/{source_id}/{article_id}")
def get_payload(source_id: str, article_id: str, s3=Depends(get_s3_client)) -> dict[str, str]:
    key = f"raw/{source_id}/{article_id}.txt"
    try:
        response = s3.get_object(Bucket=settings.s3_bucket_name, Key=key)
        content = response["Body"].read().decode("utf-8")
        return {"key": key, "content": content}
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            raise HTTPException(status_code=404, detail="payload not found")
        raise HTTPException(status_code=502, detail=str(e))
