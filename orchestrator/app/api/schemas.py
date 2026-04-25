from pydantic import BaseModel


class InferenceRequest(BaseModel):
    payload_key: str
    model_id: str = "llama-3.2-3b-q4"


class InferenceResponse(BaseModel):
    instance_id: str
    payload_key: str
    status: str
