import pickle
import sys
sys.path.append('..')

from core.predict import TextPredictor


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
        cls._predictor = TextPredictor(model_dir='../models')
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
        with open('../models/trigram_model.pkl', 'rb') as f:
            trigrams = pickle.load(f)
        with open('../models/bigram_model.pkl', 'rb') as f:
            bigrams = pickle.load(f)
        with open('../models/common_words.pkl', 'rb') as f:
            common = pickle.load(f)
        
        return {
            'trigram_count': len(trigrams),
            'bigram_count': len(bigrams),
            'common_words_count': len(common),
            'vocabulary_size': 30000
        }