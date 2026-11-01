import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(model_dir, monkeypatch):
    monkeypatch.setenv('MODEL_DIR', str(model_dir))
    from api.main import app
    with TestClient(app) as c:
        yield c


def test_predict(client):
    res = client.post('/predict', json={'text': 'new york', 'top_k': 2})
    assert res.status_code == 200
    body = res.json()
    assert body['source'] == 'trigram'
    assert body['fallback_used'] == 'trigram'
    assert body['context'] == ['New', 'York']
    assert body['input_words'] == 2
    assert [p['word'] for p in body['predictions']] == ['City', 'Times']


@pytest.mark.parametrize('payload', [
    {'text': 'hi', 'top_k': 0},
    {'text': 'hi', 'top_k': 11},
    {'text': 'a' * 2001},
])
def test_predict_validation(client, payload):
    assert client.post('/predict', json=payload).status_code == 422


def test_stats(client):
    body = client.get('/stats').json()
    assert body['trigram_count'] == 4
    assert body['vocabulary_size'] == 3
    assert body['evaluation']['accuracies']['top_5'] == 0.4


def test_health(client):
    body = client.get('/health').json()
    assert body['status'] == 'healthy'
    assert body['models_loaded'] is True
