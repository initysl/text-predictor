import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

try:
    from .schemas import (
        Prediction,
        PredictionRequest,
        PredictionResponse,
        StatsResponse,
    )
    from .models import load_predictor
except ImportError:
    from schemas import Prediction, PredictionRequest, PredictionResponse, StatsResponse
    from models import load_predictor

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models once on startup
    app.state.predictor = load_predictor()
    yield


app = FastAPI(
    title="Text Predictor API",
    description="N-gram based next-word prediction API",
    version="2.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
allow_all_origins = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Health check"""
    return {"status": "ok", "message": "Text Predictor API is running"}


@app.post("/predict", response_model=PredictionResponse)
def predict(body: PredictionRequest, request: Request):
    """Get next word predictions"""
    try:
        result = request.app.state.predictor.predict_with_context(body.text, top_k=body.top_k)
    except Exception:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed")

    return PredictionResponse(
        predictions=[Prediction(word=word, probability=prob) for word, prob in result['predictions']],
        source=result['source'],
        context=result['context'],
        input_words=result['input_words'],
        fallback_used=result['fallback_used'],
    )


@app.get("/stats", response_model=StatsResponse)
def get_stats(request: Request):
    """Get model statistics and offline evaluation results"""
    predictor = request.app.state.predictor
    return StatsResponse(**predictor.stats, evaluation=predictor.evaluation)


@app.get("/health")
def health_check(request: Request):
    """Detailed health check"""
    predictor = getattr(request.app.state, "predictor", None)
    if predictor is None:
        return {"status": "unhealthy", "models_loaded": False}

    test_result = predictor.predict("the", top_k=1)
    return {
        "status": "healthy",
        "models_loaded": True,
        "test_prediction": test_result[0][0] if test_result else None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
