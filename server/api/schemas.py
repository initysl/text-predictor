from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

PredictionSource = Literal['trigram', 'bigram', 'unigram', 'sentence_start']


class PredictionRequest(BaseModel):
    text: str = Field('', max_length=2000)
    top_k: int = Field(5, ge=1, le=10)


class Prediction(BaseModel):
    word: str
    probability: float


class PredictionResponse(BaseModel):
    predictions: List[Prediction]
    source: PredictionSource
    context: List[str]
    input_words: int
    # Deprecated alias of `source`
    fallback_used: str


class Evaluation(BaseModel):
    total_predictions: int
    accuracies: Dict[str, float]
    fallback_usage: Dict[str, int]
    coverage: float


class StatsResponse(BaseModel):
    trigram_count: int
    bigram_count: int
    common_words_count: int
    vocabulary_size: int
    model_size_mb: float
    evaluation: Optional[Evaluation] = None
