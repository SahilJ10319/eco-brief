from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "ecobrief-raw-payloads"
    s3_audio_bucket: str = "ecobrief-audio-outputs"

    class Config:
        env_file = ".env"


settings = Settings()
