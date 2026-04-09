from pathlib import Path
import pickle
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from core.predict import TextPredictor

MODEL_DIR = PROJECT_ROOT / "models"


class ModelManager:
    """Singleton to load models once and reuse"""
    
    _instance = None
    _predictor = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._load_models()
        return cls._instance
    
    @classmethod
    def _load_models(cls):
        """Load all models"""
        print("Loading models...")
        cls._predictor = TextPredictor(model_dir=MODEL_DIR)
        print("Models loaded!")
    
    @classmethod
    def get_predictor(cls):
        """Get predictor instance"""
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._predictor
    
    @classmethod
    def get_model_stats(cls):
        """Get model statistics"""
        with open(MODEL_DIR / 'trigram_model.pkl', 'rb') as f:
            trigrams = pickle.load(f)
        with open(MODEL_DIR / 'bigram_model.pkl', 'rb') as f:
            bigrams = pickle.load(f)
        with open(MODEL_DIR / 'common_words.pkl', 'rb') as f:
            common = pickle.load(f)
        
        return {
            'trigram_count': len(trigrams),
            'bigram_count': len(bigrams),
            'common_words_count': len(common),
            'vocabulary_size': 30000
        }
