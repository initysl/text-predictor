import pickle
import re
from itertools import product
from pathlib import Path

DEFAULT_MODEL_DIR = Path(__file__).resolve().parent.parent / 'models'

MODEL_FILES = (
    'trigram_model.pkl',
    'bigram_model.pkl',
    'common_words.pkl',
    'sentence_starters.pkl',
)

SENTENCE_END = {'.', '!', '?'}

# Punctuation WikiText writes as standalone tokens
_PUNCT_SPLIT = re.compile(r'([,.;:!?()"\[\]])')
# Hyphens, commas and periods inside numbers/words become @-@, @,@, @.@
_INNER_MARK = re.compile(r'(?<=\w)([-,.])(?=\w)')
# Clitics WikiText splits off: John's -> John 's, don't -> do n't
_CLITIC = re.compile(r"(?i)(\w)(n't|'s|'re|'ve|'ll|'d|'m)\b")

_DISPLAY = {'@-@': '-', '@,@': ',', '@.@': '.'}


def tokenize(text):
    """
    Split raw text into WikiText-style tokens

    Already-tokenized WikiText (e.g. 'state @-@ of') passes through unchanged.
    """
    tokens = []
    for chunk in text.split():
        if chunk in _DISPLAY:
            tokens.append(chunk)
            continue
        chunk = _INNER_MARK.sub(r' @\1@ ', chunk)
        chunk = _CLITIC.sub(r'\1 \2', chunk)
        for part in chunk.split():
            if part in _DISPLAY:
                tokens.append(part)
            else:
                tokens.extend(p for p in _PUNCT_SPLIT.split(part) if p)
    return tokens


def _case_variants(token):
    """Exact, lower and Title case spellings of a token, without duplicates"""
    return list(dict.fromkeys([token, token.lower(), token[:1].upper() + token[1:].lower()]))


class TextPredictor:
    """N-gram based text prediction with fallback strategies"""

    def __init__(self, model_dir=DEFAULT_MODEL_DIR):
        """Load all models"""
        print("Loading models...")
        model_dir = Path(model_dir)

        with open(model_dir / 'trigram_model.pkl', 'rb') as f:
            self.trigrams = pickle.load(f)

        with open(model_dir / 'bigram_model.pkl', 'rb') as f:
            self.bigrams = pickle.load(f)

        with open(model_dir / 'common_words.pkl', 'rb') as f:
            self.common_words = pickle.load(f)

        with open(model_dir / 'sentence_starters.pkl', 'rb') as f:
            self.sentence_starters = pickle.load(f)

        evaluation_path = model_dir / 'evaluation_results.pkl'
        self.evaluation = None
        if evaluation_path.exists():
            with open(evaluation_path, 'rb') as f:
                self.evaluation = pickle.load(f)

        # Computed once so /stats never has to touch the pickles again
        self.stats = {
            'trigram_count': len(self.trigrams),
            'bigram_count': len(self.bigrams),
            'common_words_count': len(self.common_words),
            'vocabulary_size': len(self.bigrams),
            'model_size_mb': round(
                sum((model_dir / name).stat().st_size for name in MODEL_FILES) / 1_000_000, 1
            ),
        }

        print("Models loaded successfully!")

    def predict(self, text, top_k=5):
        """
        Predict next word(s) for given text

        Returns:
            List of tuples: [(word, probability), ...]
        """
        return self.predict_with_context(text, top_k)['predictions']

    def predict_with_context(self, text, top_k=5):
        """
        Predict next words along with how the prediction was made

        Returns:
            dict with predictions, source (trigram | bigram | unigram | sentence_start),
            the context tokens that matched, and the number of input tokens
        """
        tokens = tokenize(text)

        if not tokens or tokens[-1] in SENTENCE_END:
            return self._result(self._rank(self.sentence_starters, top_k), 'sentence_start', [], tokens)

        # Trigram (need at least 2 tokens)
        if len(tokens) >= 2:
            match = self._lookup_trigram(tokens[-2], tokens[-1])
            if match:
                context, next_words = match
                predictions = self._calculate_probabilities(next_words, top_k)
                if predictions:
                    return self._result(predictions, 'trigram', list(context), tokens)

        # Bigram (fallback if trigram fails)
        match = self._lookup_bigram(tokens[-1])
        if match:
            context, next_words = match
            predictions = self._calculate_probabilities(next_words, top_k)
            if predictions:
                return self._result(predictions, 'bigram', [context], tokens)

        # Common words (last resort)
        return self._result(self._rank(self.common_words, top_k), 'unigram', [], tokens)

    def _result(self, predictions, source, context, tokens):
        return {
            'predictions': predictions,
            'source': source,
            # Kept for older callers (cli.py, evaluate.py)
            'fallback_used': source,
            'context': [self._clean_token(t) for t in context],
            'input_words': len(tokens),
        }

    def _lookup_trigram(self, word1, word2):
        """Find a trigram context, trying exact case before lower/Title case"""
        for context in product(_case_variants(word1), _case_variants(word2)):
            if context in self.trigrams:
                return context, self.trigrams[context]
        return None

    def _lookup_bigram(self, word):
        """Find a bigram context, trying exact case before lower/Title case"""
        for context in _case_variants(word):
            if context in self.bigrams:
                return context, self.bigrams[context]
        return None

    def _calculate_probabilities(self, next_words, top_k):
        """
        Convert a {word: count} dict to the top K (word, probability) pairs
        """
        total = sum(next_words.values())
        if total == 0:
            return []

        sorted_words = sorted(next_words.items(), key=lambda x: x[1], reverse=True)
        return self._take(((word, count / total) for word, count in sorted_words), top_k)

    def _rank(self, words, top_k):
        """
        Rank-weighted (Zipf) probabilities for frequency-ordered word lists
        that carry no counts, i.e. common words and sentence starters
        """
        if not words:
            return []
        weights = [1 / rank for rank in range(1, len(words) + 1)]
        total = sum(weights)
        return self._take(((word, w / total) for word, w in zip(words, weights)), top_k)

    def _take(self, scored, top_k):
        """Clean tokens, drop <unk> and stop once top_k predictions are collected"""
        result = []
        for word, prob in scored:
            if word == '<unk>':
                continue
            result.append((self._clean_token(word), prob))
            if len(result) == top_k:
                break
        return result

    def _clean_token(self, word):
        """Clean WikiText special tokens for display"""
        return _DISPLAY.get(word, word)


# Simple function interface for quick use
def predict_next_word(text, model_dir=DEFAULT_MODEL_DIR, top_k=5):
    """
    Convenience function for one-off predictions

    Returns:
        List of (word, probability) tuples
    """
    predictor = TextPredictor(model_dir)
    return predictor.predict(text, top_k)


# Testing
if __name__ == "__main__":
    print("Initializing predictor...")
    predictor = TextPredictor()

    test_cases = [
        "",  # Empty input
        "The",  # Single word
        "New York",  # Common phrase
        "new york",  # Case-insensitive lookup
        "according to",  # Common pattern
        "It ended.",  # Sentence start
        "xyzzy",  # Unknown word -> unigram
        "state-of",  # Hyphen tokenization
    ]

    print("\n" + "-"*10)
    print("TESTING PREDICTIONS")
    print("-"*10)

    for text in test_cases:
        result = predictor.predict_with_context(text, top_k=3)

        print(f"\nInput: '{text}'")
        print(f"Source: {result['source']}  context: {result['context']}")
        print("Predictions:")
        for word, prob in result['predictions']:
            print(f"  {word:15} ({prob:.1%})")
