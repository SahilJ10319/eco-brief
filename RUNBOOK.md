# EcoBrief Runbook

## Overview
EcoBrief is a zero-cost distributed AI inference platform designed for high performance and low overhead. It orchestrates data ingestion, triggers inference via Ray Serve on ephemeral EC2 instances, and generates audio via AWS Polly.

## System Architecture
1. **Ingestion Service (Java):** Scrapes RSS feeds and pushes raw text to the raw S3 bucket.
2. **Orchestrator (Python FastAPI):** API layer that tracks payload state and dynamically boots inference instances via boto3.
3. **Inference Node (Python Ray Serve):** Ephemeral 2GB EC2 instance that pulls text, runs local LLM inference via llama.cpp, generates MP3 via Polly, uploads to the audio bucket, and gracefully self-terminates.
4. **Dashboard (React/Vite):** Real-time UI displaying payload states and native audio streaming.

## Operational Procedures

### Starting the Orchestrator
```bash
cd orchestrator
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Starting the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

### Running System Diagnostics
We utilize automated telemetry to guarantee the FinOps scale-to-zero constraint.
```bash
cd orchestrator
python -m tests.test_e2e_pipeline
python -m tests.verify_finops
```

## Incident Management
**Issue:** Inference instances hanging or failing to self-terminate.
**Action:** Execute the `verify_finops.py` telemetry script to immediately identify zombie instances. Manually terminate via AWS CLI if necessary:
`aws ec2 terminate-instances --instance-ids <id>`
