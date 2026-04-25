from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "ecobrief-raw-payloads"
    s3_audio_bucket: str = "ecobrief-audio-outputs"

    ec2_ami_id: str = "ami-0c02fb55956c7d316"
    ec2_instance_type: str = "t4g.small"
    ec2_security_group_ids: str = ""
    ec2_iam_profile: str = "ecobrief-inference-role"

    model_cache_capacity: int = 5

    class Config:
        env_file = ".env"

    @property
    def security_group_list(self) -> list[str]:
        return [g.strip() for g in self.ec2_security_group_ids.split(",") if g.strip()]


settings = Settings()
