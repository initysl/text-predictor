import pickle


class TextPredictor:
    """N-gram based text prediction with fallback strategies"""

    def __init__(self, model_dir='models'):
        """Load all models"""
        print("Loading models...")

        with open(f'{model_dir}/trigram_model.pkl', 'rb') as f:
            self.trigrams = pickle.load(f)

        with open(f'{model_dir}/bigram_model.pkl', 'rb') as f:
            self.bigrams = pickle.load(f)

        with open(f'{model_dir}/common_words.pkl', 'rb') as f:
            self.common_words = pickle.load(f)
        
        with open(f'{model_dir}/sentence_starters.pkl', 'rb') as f:
            self.sentence_starters = pickle.load(f)
        
        print("Models loaded successfully!")

    def predict(self, text, top_k=5):
        """
        Predict nex word(s) for given text

        Args:
            text: Input text string
            top_k: Number of predictions to return

        Returns:
            List of tuples: [(word, probality), ...]
        """

        text = text.strip()
        if not text:
            return self._format_predictions(self.sentence_starters[:top_k])
        
        if text and text[-1] in '.!?':
            return self._format_predictions(self.sentence_starters[:top_k])
        
        words = text.lower().split()

        if len(words) == 0:
            return self._format_predictions(self.sentence_starters[:top_k])
        
        # Fallback chain
        predictions = None
        fallback_used = None

        # Trigram (need at least 2 words)
        if len(words) >=2:
            predictions = self._try_trigram(words[-2], words[-1])
            if predictions:
                fallback_used = "trigram"
        
        # Bigram (fallback if trigram fails)
        if not predictions and len(words) >= 1:
            predictions = self._try_bigram(words[-1])
            if predictions:
                fallback_used = "bigram"
        
        # Common words (last resort)
        if not predictions:
            predictions = self.common_words[:top_k]
            fallback_used = "common"
        
        # Convert to probalities and return top K
        result = self._calculate_probabilities(predictions, top_k)

        # Clean specail tokens in output
        result = [(self._clean_token(word), prob) for word, prob in result]

        return result

    def _try_trigram(self, word1, word2):
        """Try to get predictions from trigram model"""
        context = (word1, word2)
        if context in self.trigrams:
            return self.trigrams[context]
        return None
    
    def _try_bigram(self, word):
        """Try to get predictions from bigram model"""
        if word in self.bigrams:
            return self.bigrams[word]
        return None

    def _calculate_probabilities(self, next_words, top_k):
        """
        Convert word counts to probabilities
        
        Args:
            next_words: Either dict {word: count} or list [word1, word2, ...]
            top_k: Number of predictions to return
        
        Returns:
            List of tuples: [(word, probability), ...]
        """
        #Handle list input (common_words/sentence_starters)
        if isinstance(next_words, dict):
            # Calculate total count
            total = sum(next_words.values())
            if total == 0:
                return []
            
            # Sort by count and take take top K
            sorted_words = sorted(next_words.items(), key=lambda x: x[1], reverse=True)[:top_k]
            # Counts to probabilities
            return [(word, count / total) for word, count in sorted_words]
        
        return []
    
    def _format_predictions(self, words):
        """Format list of words into (word, probability) tuples"""
        if not words:
            return []
        prob = 1.0 / len(words)
        return [(word, prob) for word in words]
    
    def _clean_token(self, word):
        """Clean WikiText special tokens for display"""
        word = word.replace('@-@', '-')

        if word == '<unk>':
            return '[unknown]'
        
        return word
    
    def predict_with_context(self, text, top_k=5):
        """
        Predict with additional context information
        
        Returns:
            dict with predictions and metadata
        """
        predictions = self.predict(text, top_k)

        # Determine which fallback was used
        words = text.lower().strip().split()
        fallback_used = "empty"

        if len(words) >= 2:
            context = (words[-2], words[-1])
            if context in self.trigrams:
                fallback_used = "trigram"
            elif words[-1] in self.bigrams:
                fallback_used = "bigram"
            else:
                fallback_used = "common"
        elif len(words) == 1:
            if words[0] in self.bigrams:
                fallback_used = "bigram"
            else:
                fallback_used = "common"
        
        return {
            'predictions': predictions,
            'fallback_used': fallback_used,
            'input_words': len(words)
        }
    

# Simple function interface for quick use
def predict_next_word(text, model_dir='models', top_k=5):
    """
    Convenience function for one-off predictions
    
    Args:
        text: Input text
        model_dir: Directory containing model files
        top_k: Number of predictions
    
    Returns:
        List of (word, probability) tuples
    """
    predictor = TextPredictor(model_dir)
    return predictor.predict(text, top_k)


# Testing
if __name__ == "__main__":
    print("Initializing predictor...")
    predictor = TextPredictor()
    
    # Test cases
    test_cases = [
        "",  # Empty input
        "The",  # Single word
        "New York",  # Common phrase
        "according to",  # Common pattern
        "I love eating",  # Trigram test
        "quantum physics",  # Might not be in vocab
        "state @-@ of",  # Special token test
    ]
    
    print("\n" + "-"*10)
    print("TESTING PREDICTIONS")
    print("-"*10)
    
    for text in test_cases:
        result = predictor.predict_with_context(text, top_k=3)
        predictions = result['predictions']
        fallback = result['fallback_used']
        
        print(f"\nInput: '{text}'")
        print(f"Fallback used: {fallback}")
        print("Predictions:")
        for word, prob in predictions:
            print(f"  {word:15} ({prob:.1%})")