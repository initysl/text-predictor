from pydantic import BaseModel
from typing import List


class PredictionRequest(BaseModel):
    text: str
    top_k: int = 5


class Prediction(BaseModel):
    word: str
    probability: float


class PredictionResponse(BaseModel):
    predictions: List[Prediction]
    fallback_used: str
    input_words: int


class StatsResponse(BaseModel):
    trigram_count: int
    bigram_count: int
    common_words_count: int
    vocabulary_size: int