# EcoBrief 

> **A distributed serverless AI news oracle.**

EcoBrief is a zero-cost, distributed AI inference platform designed for high performance and low overhead. It autonomously curates web data, summarizes it using Small Language Models (SLMs), and delivers personalized audio briefings via a minimalist web interface.

Built to emphasize absolute control over MLOps and Cloud FinOps, the architecture revolves around a strict **"Scale-to-Zero"** infrastructure to ensure AWS operational costs remain practically nonexistent.

##  Key Features

*   **Automated Data Ingestion:** Robust Java-based pipeline that intelligently scrapes, parses, and sanitizes RSS feeds and third-party APIs directly into AWS S3 data lakes.
*   **Hyper-Constrained AI Inference:** Orchestrates text summarization using Ray Serve + llama-cpp-python to run a quantized 3-Billion parameter language model (e.g., Llama-3.2-3B) tightly within a 2GB RAM ephemeral environment.
*   **Active Cloud FinOps (Scale-to-Zero):** Masterful Boto3 automation scripts that dynamically boot lean EC2 instances solely for the duration of inference workloads, then deliberately and instantly terminate them to prevent idle billing.
*   **Audio Generation & Delivery:** Seamless integration with AWS Polly to formulate human-like MP3 audio briefings, served to users via an interactive React frontend.

##  Technology Stack

### Application & API
*   **Frontend Library:** React, Vite
*   **Styling:** Tailwind CSS
*   **Core API:** FastAPI (Python)

### Data & Machine Learning
*   **Big Data Processing:** Java
*   **Inference Orchestrator:** Ray Serve
*   **Model Pipeline:** llama-cpp-python
*   **Language Models:** Quantized 3B Parameter Models

### Cloud Infrastructure
*   **Provider:** AWS (Free Tier emphasized)
*   **Storage & Services:** Amazon S3, Amazon Polly
*   **Compute & Automation:** ARM EC2 Instances, Boto3

##  Technical Architecture & Pipeline

1.  **Ingest & Prep:** Scheduled Java applications run to obtain raw news content, sanitize the payload, and deposit it into S3 buckets.
2.  **Autonomous Spawn:** A FastAPI microservice triggers an LRU (Least Recently Used) cache/multiplexer script. Using Boto3, it boots a targeted EC2 instance exactly when a request arrives.
3.  **Inference & Audio:** The EC2 machine loads the 3B quantized AI model into RAM safely, creates the intelligence transcript, and prompts AWS Polly to synthesize the final MP3 briefing.
4.  **Auto-Termination:** Immediately following the generation of audio files (saved back to S3), the EC2 instance commits self-termination, scaling costs directly back to zero.
5.  **User Interface:** The polished React frontend retrieves the links and allows consumers to view the transcript text and natively play the high-quality MP3 briefing.
