import base64
from string import Template


_USER_DATA_TEMPLATE = Template("""#!/bin/bash
set -e

export AWS_DEFAULT_REGION=$aws_region
export S3_RAW_BUCKET=$s3_raw_bucket
export S3_AUDIO_BUCKET=$s3_audio_bucket
export PAYLOAD_KEY=$payload_key
export MODEL_ID=$model_id

yum update -y
yum install -y python3 python3-pip git

pip3 install llama-cpp-python ray boto3 fastapi uvicorn

aws s3 cp s3://$$S3_RAW_BUCKET/scripts/inference_payload.py /tmp/inference_payload.py

python3 /tmp/inference_payload.py \
    --bucket-raw $$S3_RAW_BUCKET \
    --bucket-audio $$S3_AUDIO_BUCKET \
    --payload-key $$PAYLOAD_KEY \
    --model-id $$MODEL_ID

shutdown -h now
""")


def build_user_data(
    aws_region: str,
    s3_raw_bucket: str,
    s3_audio_bucket: str,
    payload_key: str,
    model_id: str,
) -> str:
    script = _USER_DATA_TEMPLATE.substitute(
        aws_region=aws_region,
        s3_raw_bucket=s3_raw_bucket,
        s3_audio_bucket=s3_audio_bucket,
        payload_key=payload_key,
        model_id=model_id,
    )
    return base64.b64encode(script.encode("utf-8")).decode("utf-8")
