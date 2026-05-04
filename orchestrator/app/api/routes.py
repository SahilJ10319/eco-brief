from fastapi import APIRouter, HTTPException, Depends
from botocore.exceptions import ClientError
from app.core.aws import get_s3_client
from app.core.config import settings
from app.core.ec2_manager import EC2Manager
from app.core.user_data import build_user_data
from app.api.schemas import InferenceRequest, InferenceResponse
from typing import Any

router = APIRouter()

_ec2_manager = EC2Manager()


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/payloads")
def list_payloads(s3=Depends(get_s3_client)) -> list[dict[str, Any]]:
    try:
        raw_resp = s3.list_objects_v2(Bucket=settings.s3_bucket_name, Prefix="raw/")
        raw_objs = raw_resp.get("Contents", [])

        audio_resp = s3.list_objects_v2(Bucket=settings.s3_audio_bucket, Prefix="summaries/")
        audio_keys = {obj["Key"] for obj in audio_resp.get("Contents", [])}

        results = []
        for obj in raw_objs:
            key = obj["Key"]
            summary_key = key.replace("raw/", "summaries/")
            is_processed = summary_key in audio_keys
            results.append({
                "key": key,
                "size": obj["Size"],
                "last_modified": str(obj["LastModified"]),
                "status": "completed" if is_processed else "pending"
            })
        return results
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


@router.get("/summaries/{source_id}/{article_id}")
def get_summary(source_id: str, article_id: str, s3=Depends(get_s3_client)) -> dict[str, str]:
    key = f"summaries/{source_id}/{article_id}.txt"
    try:
        response = s3.get_object(Bucket=settings.s3_audio_bucket, Key=key)
        content = response["Body"].read().decode("utf-8")
        return {"key": key, "content": content}
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            raise HTTPException(status_code=404, detail="summary not found")
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/audio/{source_id}/{article_id}")
def get_audio_url(source_id: str, article_id: str, s3=Depends(get_s3_client)) -> dict[str, str]:
    key = f"summaries/{source_id}/{article_id}.mp3"
    try:
        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": settings.s3_audio_bucket, "Key": key},
            ExpiresIn=3600
        )
        return {"url": url}
    except ClientError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/inference/trigger", response_model=InferenceResponse)
def trigger_inference(request: InferenceRequest) -> InferenceResponse:
    user_data = build_user_data(
        aws_region=settings.aws_region,
        s3_raw_bucket=settings.s3_bucket_name,
        s3_audio_bucket=settings.s3_audio_bucket,
        payload_key=request.payload_key,
        model_id=request.model_id,
    )
    try:
        instance_id = _ec2_manager.launch_inference_instance(
            ami_id=settings.ec2_ami_id,
            instance_type=settings.ec2_instance_type,
            user_data=user_data,
            security_group_ids=settings.security_group_list,
            iam_instance_profile=settings.ec2_iam_profile,
        )
    except ClientError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return InferenceResponse(
        instance_id=instance_id,
        payload_key=request.payload_key,
        status="launched",
    )
