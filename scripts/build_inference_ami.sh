#!/bin/bash
set -e

echo "==> ecobrief inference ami builder"
echo "==> run this on a fresh t4g.small (arm64) amazon linux 2023 instance"
echo "==> when done it will print the ami id to paste into your orchestrator .env"
echo ""

if [ -z "$S3_RAW_BUCKET" ]; then
    echo "ERROR: set S3_RAW_BUCKET before running (the bucket holding models/ and scripts/)"
    exit 1
fi

INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

echo "==> instance: $INSTANCE_ID in $REGION"

echo "==> installing system packages"
sudo yum update -y
sudo yum install -y python3 python3-pip gcc gcc-c++ cmake openblas-devel git

echo "==> installing python dependencies"
CMAKE_ARGS="-DLLAMA_BLAS=ON -DLLAMA_BLAS_VENDOR=OpenBLAS" \
    pip3 install --no-cache-dir \
    "ray[serve]>=2.9.0" \
    llama-cpp-python \
    boto3 \
    fastapi \
    uvicorn

echo "==> downloading inference script from s3"
aws s3 cp s3://$S3_RAW_BUCKET/scripts/inference_payload.py /tmp/inference_payload.py

echo "==> downloading model from s3 (this will take a few minutes)"
mkdir -p /tmp/models
aws s3 cp s3://$S3_RAW_BUCKET/models/llama-3.2-3b-q4.gguf /tmp/llama-3.2-3b-q4.gguf

echo "==> all dependencies installed and model cached"
echo ""
echo "==> creating ami from this instance..."
AMI_NAME="ecobrief-inference-$(date +%Y%m%d-%H%M)"
AMI_ID=$(aws ec2 create-image \
    --instance-id $INSTANCE_ID \
    --name "$AMI_NAME" \
    --description "ecobrief inference node with ray serve and llama.cpp pre-installed" \
    --region $REGION \
    --query 'ImageId' \
    --output text)

echo ""
echo "==> ami creation started: $AMI_ID"
echo "==> waiting for ami to become available (5-10 minutes)..."

aws ec2 wait image-available --image-ids $AMI_ID --region $REGION

echo ""
echo "========================================"
echo "  AMI READY: $AMI_ID"
echo "========================================"
echo ""
echo "paste this into orchestrator/.env:"
echo "  EC2_AMI_ID=$AMI_ID"
echo ""
echo "you can now terminate this setup instance."
