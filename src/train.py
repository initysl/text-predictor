import pickle
from collections import defaultdict

def build_trigram_model(file_path: str, min_count: int = 5, max_vocab: int = 50000):
    """Build trigram model from WikiText data"""
    
    print("Step 1: Building vocabulary...")
    
    # First pass: count word frequencies
    word_freq = defaultdict(int)
    line_count = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('='):
                continue
            
            line_count += 1
            if line_count % 200000 == 0:
                print(f"  Counting words: {line_count:,} lines")
            
            for word in line.split():
                word_freq[word] += 1
    
    # Keep only top N most common words
    print(f"\nTotal unique words: {len(word_freq):,}")
    top_words = set(sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:max_vocab])
    vocab = {word for word, count in top_words}
    print(f"Vocabulary limited to: {len(vocab):,} words")
    del word_freq  # Free memory
    
    print("\nStep 2: Building trigrams...")
    
    # Second pass: build trigrams with limited vocab
    trigrams = defaultdict(lambda: defaultdict(int))
    line_count = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('='):
                continue
            
            line_count += 1
            if line_count % 200000 == 0:
                print(f"  Building trigrams: {line_count:,} lines, {len(trigrams):,} unique")
            
            words = line.split()
            if len(words) < 3:
                continue
            
            # Only process words in vocabulary
            for i in range(len(words) - 2):
                w1, w2, w3 = words[i], words[i+1], words[i+2]
                
                # Skip if any word not in vocab
                if w1 not in vocab or w2 not in vocab or w3 not in vocab:
                    continue
                
                trigrams[(w1, w2)][w3] += 1
    
    print(f"\nTotal trigrams before filtering: {len(trigrams):,}")
    
    # Filter rare trigrams
    filtered = {}
    for context, next_words in trigrams.items():
        filtered_next = {w: c for w, c in next_words.items() if c >= min_count}
        if filtered_next:
            filtered[context] = filtered_next
    
    print(f"After filtering (min_count={min_count}): {len(filtered):,}")
    
    return filtered

def save_model(trigrams, output_path):
    """Save model"""
    with open(output_path, 'wb') as f:
        pickle.dump(trigrams, f)
    print(f"Model saved to {output_path}")

if __name__ == "__main__":
    trigrams = build_trigram_model(
        'data/wikitext-103/wiki.train.tokens',
        min_count=10,     
        max_vocab=30000   
    )
    
    save_model(trigrams, 'models/trigram_model.pkl')