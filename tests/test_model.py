import pickle

with open('models/trigram_model.pkl', 'rb') as f:
    trigrams = pickle.load(f)

def test_trigram_model():
        """Test trigram model predictions"""
        test_contexts = [
            ("New", "York"),
            ("Barrack", "Abraham"),
            ("the", "first"),
            ("in", "the"),
            ("the", "United"),
            ("do", "you"),
            ("United", "States"),
            ("according", "to")
        ]
        
        for w1, w2 in test_contexts:
            context = (w1, w2)
            if context in trigrams:
                next_words = trigrams[context]
                sorted_next = sorted(next_words.items(), key=lambda x: x[1], reverse=True)
                print(f"Context: {context} -> Top predictions: {sorted_next[:5]}")
            else:
                print(f"Context: {context} not found in model")
        print("Trigram model test completed.")

if __name__ == "__main__":
    test_trigram_model()