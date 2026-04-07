from fastapi import FastAPI
from src.predict import TextPredictor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

predictor = TextPredictor(model_dir="models")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(data: dict):
    text = data.get("text", "")
    top_k = data.get("top_k", 5)

    return predictor.predict_with_context(text, top_k)



