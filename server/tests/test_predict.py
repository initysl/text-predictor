import pytest

from core.predict import tokenize


@pytest.mark.parametrize('text, expected', [
    ('York,', ['York', ',']),
    ('state-of', ['state', '@-@', 'of']),
    ('state @-@ of', ['state', '@-@', 'of']),
    ("John's car", ['John', "'s", 'car']),
    ("don't", ['do', "n't"]),
    ('1,000 people.', ['1', '@,@', '000', 'people', '.']),
    ('(hello)', ['(', 'hello', ')']),
    ('   ', []),
])
def test_tokenize(text, expected):
    assert tokenize(text) == expected


def test_trigram_hit(predictor):
    result = predictor.predict_with_context('I live in New York', top_k=2)
    assert result['source'] == 'trigram'
    assert result['context'] == ['New', 'York']
    assert [w for w, _ in result['predictions']] == ['City', 'Times']


def test_trigram_is_case_insensitive(predictor):
    result = predictor.predict_with_context('new york', top_k=1)
    assert result['source'] == 'trigram'
    assert result['predictions'][0][0] == 'City'


def test_hyphenated_input_matches_and_output_is_cleaned(predictor):
    result = predictor.predict_with_context('state-of', top_k=2)
    assert result['source'] == 'trigram'
    assert result['context'] == ['-', 'of']
    assert result['predictions'][0][0] == '-'


def test_bigram_fallback(predictor):
    result = predictor.predict_with_context('Old York', top_k=5)
    assert result['source'] == 'bigram'
    assert result['context'] == ['York']
    assert {w for w, _ in result['predictions']} == {'City', ','}


def test_unigram_fallback_is_not_empty(predictor):
    result = predictor.predict_with_context('xyzzy', top_k=5)
    assert result['source'] == 'unigram'
    assert len(result['predictions']) == 5
    assert '<unk>' not in [w for w, _ in result['predictions']]


@pytest.mark.parametrize('text', ['', 'It ended.', 'Really?'])
def test_sentence_start(predictor, text):
    result = predictor.predict_with_context(text, top_k=3)
    assert result['source'] == 'sentence_start'
    assert [w for w, _ in result['predictions']] == ['The', 'In', 'On']


def test_unk_filtered_from_ngrams(predictor):
    result = predictor.predict_with_context('the end', top_k=5)
    assert [w for w, _ in result['predictions']] == ['of']


@pytest.mark.parametrize('text', ['', 'New York', 'Old York', 'xyzzy', 'the end'])
def test_probabilities_are_valid(predictor, text):
    probs = [p for _, p in predictor.predict(text, top_k=10)]
    assert all(0 < p <= 1 for p in probs)
    assert sum(probs) <= 1 + 1e-9
    assert probs == sorted(probs, reverse=True)


def test_stats_are_precomputed(predictor):
    assert predictor.stats['trigram_count'] == 4
    assert predictor.stats['bigram_count'] == 3
    assert predictor.stats['model_size_mb'] >= 0
    assert predictor.evaluation['coverage'] == 0.9
