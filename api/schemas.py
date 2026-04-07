from pydantic import BaseModel

class PredictRequest(BaseModel):
    text: str
    top_k: int = 5