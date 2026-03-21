# EcoBrief: The Truth Book

This document serves as the absolute source of truth for the EcoBrief architecture, features, and zero-cost constraints.

## 1. Core Objective
Develop a zero-cost, distributed AI inference platform that automates the curation, summarization, and audio delivery of daily news via a minimalist web interface.

## 2. Engineering Constraints
- **Zero-Cost MLOps:** Strict operational adherence to the AWS Free Tier.
- **Scale-to-Zero:** All LLM inference must happen on dynamic ephemeral EC2 instances, booted and destroyed autonomously via Boto3 to prevent idle billing.
- **Constrained Inference:** The AI engine (Llama-3.2-3B or similar quantized SLM) must successfully execute text summarization within a strict 2GB RAM environment.

## 3. Component Architecture
- **Data Ingestion (Java):** Scheduled jobs to parse RSS feeds and third-party APIs, clean the text payloads, and upload them to AWS S3.
- **Orchestrator (Python/FastAPI):** Central router that receives triggering requests and initiates the Boto3 EC2 spawn sequence.
- **Inference Node (Ray + Llama.cpp):** The payload script deployed to the ephemeral EC2 instances, designed to generate the LLM transcript and hit the AWS Polly API for audio generation.
- **Frontend (React/Vite):** A high-performance, dashboard-style UI providing users with reading and playback capabilities.

## 4. Development Roadmap
- **Phase 1: Ingestion Engine** (Java S3 pipelines, parsers, scheduling)
- **Phase 2: Orchestration** (FastAPI, Boto3 scale-to-zero infrastructure)
- **Phase 3: AI & Audio** (Ray Serve, llama-cpp-python optimization, AWS Polly integration)
- **Phase 4: Client Application** (React UI construction, audio streaming)
- **Phase 5: Integration** (End-to-end testing, FinOps audits, deployment)
