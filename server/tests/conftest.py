import pickle
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

TRIGRAMS = {
    ('New', 'York'): {'City': 6, 'Times': 3, ',': 1},
    ('state', '@-@'): {'of': 10},
    ('@-@', 'of'): {'@-@': 9, 'the': 1},
    ('the', 'end'): {'<unk>': 50, 'of': 5},
}
BIGRAMS = {
    'York': {'City': 4, ',': 4},
    'the': {'first': 3, 'same': 1},
    'end': {'of': 5},
}
COMMON_WORDS = ['the', '<unk>', ',', '.', 'of', 'and', 'to']
SENTENCE_STARTERS = ['The', 'In', 'On', 'A', 'After', 'As']
EVALUATION = {
    'total_predictions': 100,
    'accuracies': {'top_1': 0.2, 'top_3': 0.3, 'top_5': 0.4},
    'fallback_usage': {'trigram': 60, 'bigram': 30, 'common': 10},
    'coverage': 0.9,
}


@pytest.fixture
def model_dir(tmp_path):
    for name, obj in [
        ('trigram_model.pkl', TRIGRAMS),
        ('bigram_model.pkl', BIGRAMS),
        ('common_words.pkl', COMMON_WORDS),
        ('sentence_starters.pkl', SENTENCE_STARTERS),
        ('evaluation_results.pkl', EVALUATION),
    ]:
        with open(tmp_path / name, 'wb') as f:
            pickle.dump(obj, f)
    return tmp_path


@pytest.fixture
def predictor(model_dir):
    from core.predict import TextPredictor
    return TextPredictor(model_dir=model_dir)
