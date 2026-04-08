import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionRequest, PredictionResponse, Prediction, StatsResponse
from models import ModelManager

app = FastAPI(
    title="Text Predictor API",
    description="N-gram based next-word prediction API",
    version="1.0.0"
)

origins = os.getenv("CORS_ORIGINS", "*")
origins_list = [origin.strip() for origin in origins.split(",") if origin]
if not origins_list:
    origins_list = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models on startup
@app.on_event("startup")
def load_models():
    global model_manager
    model_manager = ModelManager()


@app.get("/")
def read_root():
    """Health check"""
    return {"status": "ok", "message": "Text Predictor API is running"}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Get next word predictions"""
    try:
        predictor = model_manager.get_predictor()
        
        result = predictor.predict_with_context(
            request.text,
            top_k=request.top_k
        )
        
        # Format predictions
        predictions = [
            Prediction(word=word, probability=prob)
            for word, prob in result['predictions']
        ]
        
        return PredictionResponse(
            predictions=predictions,
            fallback_used=result['fallback_used'],
            input_words=result['input_words']
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats", response_model=StatsResponse)
def get_stats():
    """Get model statistics"""
    try:
        stats = model_manager.get_model_stats()
        return StatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health_check():
    """Detailed health check"""
    try:
        predictor = model_manager.get_predictor()
        
        # Test prediction
        test_result = predictor.predict("test", top_k=1)
        
        return {
            "status": "healthy",
            "models_loaded": True,
            "test_prediction": test_result[0][0] if test_result else None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)