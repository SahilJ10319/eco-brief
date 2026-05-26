# EcoBrief — Frontend

The frontend module for EcoBrief is a React/Vite single-page application. It connects to the FastAPI orchestrator to display raw S3 payloads, trigger the scale-to-zero inference pipeline, and stream the resulting Polly-generated MP3 audio briefings.

## Running locally

```bash
npm install
npm run dev
```

The app defaults to connecting to `http://localhost:8000/api/v1`. Override this by setting the `VITE_API_URL` environment variable in a `.env.local` file.

## Building for production

```bash
npm run build
```

The compiled static assets are output to `dist/` and served by the nginx container defined in the root `docker-compose.yml`.
