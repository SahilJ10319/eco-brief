import argparse
import boto3
import ray
from ray import serve
from llama_cpp import Llama


class AudioEngine:
    def __init__(self, region_name: str = "us-east-1"):
        self.polly = boto3.client("polly", region_name=region_name)

    def generate_speech(self, text: str) -> bytes:
        response = self.polly.synthesize_speech(
            Text=text,
            OutputFormat="mp3",
            VoiceId="Matthew",
            Engine="neural"
        )
        if "AudioStream" in response:
            return response["AudioStream"].read()
        raise RuntimeError("failed to synthesize speech")


@serve.deployment(num_replicas=1, ray_actor_options={"num_cpus": 2})
class SummarizationDeployment:
    def __init__(self, model_id: str):
        self.model_path = f"/tmp/{model_id}.gguf"
        
        self.llm = Llama(
            model_path=self.model_path,
            n_ctx=512,
            n_threads=2,
            n_batch=16,
            use_mlock=False,
            use_mmap=True,
            verbose=False
        )

    def __call__(self, text: str) -> str:
        prompt = f"summarize the following news text concisely:\n\n{text}\n\nsummary:"
        response = self.llm(
            prompt,
            max_tokens=150,
            temperature=0.3,
            stop=["\n\n"]
        )
        return response["choices"][0]["text"].strip()


def download_model(model_id: str, bucket: str):
    s3 = boto3.client("s3")
    local_path = f"/tmp/{model_id}.gguf"
    try:
        s3.download_file(bucket, f"models/{model_id}.gguf", local_path)
    except Exception:
        pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bucket-raw", required=True)
    parser.add_argument("--bucket-audio", required=True)
    parser.add_argument("--payload-key", required=True)
    parser.add_argument("--model-id", required=True)
    args = parser.parse_args()

    download_model(args.model_id, args.bucket_raw)

    ray.init(num_cpus=2)
    serve.start()

    app = SummarizationDeployment.bind(args.model_id)
    handle = serve.run(app)

    s3 = boto3.client("s3")
    local_txt = "/tmp/raw.txt"
    s3.download_file(args.bucket_raw, args.payload_key, local_txt)

    with open(local_txt, "r") as f:
        content = f.read()

    summary = ray.get(handle.remote(content))

    audio_engine = AudioEngine()
    mp3_data = audio_engine.generate_speech(summary)

    txt_key = args.payload_key.replace("raw/", "summaries/")
    s3.put_object(Bucket=args.bucket_audio, Key=txt_key, Body=summary.encode("utf-8"))

    mp3_key = args.payload_key.replace("raw/", "audio/").replace(".txt", ".mp3")
    s3.put_object(Bucket=args.bucket_audio, Key=mp3_key, Body=mp3_data)

    ray.shutdown()


if __name__ == "__main__":
    main()
