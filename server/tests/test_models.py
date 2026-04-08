import pickle

print("Loading models...")

with open('models/trigram_model.pkl', 'rb') as f:
    trigrams = pickle.load(f)

with open('models/bigram_model.pkl', 'rb') as f:
    bigrams = pickle.load(f)

with open('models/common_words.pkl', 'rb') as f:
    common_words = pickle.load(f)

with open('models/sentence_starters.pkl', 'rb') as f:
    starters = pickle.load(f)

print(f"\nTrigrams: {len(trigrams):,} contexts")
print(f"Bigrams: {len(bigrams):,} contexts")
print(f"Common words: {len(common_words)} words")
print(f"Sentence starters: {len(starters)} words")

# Test trigram lookup
test = ("New", "York")
if test in trigrams:
    print(f"\nTest passed: '{test[0]} {test[1]}' found in trigrams")
    print(f"   Next words: {list(trigrams[test].keys())[:5]}")
else:
    print(f"\n  '{test[0]} {test[1]}' not found (might not be in 30k vocab)")

print("\nAll models loaded successfully!")