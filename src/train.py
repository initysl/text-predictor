import pickle
from collections import defaultdict


def build_vocabulary(file_path, max_vocab=30000):
    """Build vocabulary from WikiText data (shared across all models)"""
    
    print("Building vocabulary...")
    
    word_freq = defaultdict(int)
    line_count = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('='):
                continue
            
            line_count += 1
            if line_count % 200000 == 0:
                print(f"  Processing: {line_count:,} lines")
            
            for word in line.split():
                # Skip <unk> tokens
                if word == '<unk>':
                    continue
                word_freq[word] += 1
    
    print(f"\nTotal unique words: {len(word_freq):,}")
    
    # Keep only top N most common words
    top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:max_vocab]
    vocab = {word for word, count in top_words}
    
    print(f"Vocabulary limited to: {len(vocab):,} words")
    
    return vocab, word_freq


def build_trigram_model(file_path, vocab, min_count=5):
    """Build trigram model from WikiText data"""
    
    print("\nBuilding trigrams...")
    
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
            
            # Extract trigrams
            for i in range(len(words) - 2):
                w1, w2, w3 = words[i], words[i+1], words[i+2]
                
                # Skip if any word not in vocab or is <unk>
                if (w1 not in vocab or w2 not in vocab or w3 not in vocab or
                    w1 == '<unk>' or w2 == '<unk>' or w3 == '<unk>'):
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


def build_bigram_model(file_path, vocab, min_count=5):
    """Build bigram model from WikiText data"""
    
    print("\nBuilding bigrams...")
    
    bigrams = defaultdict(lambda: defaultdict(int))
    line_count = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('='):
                continue
            
            line_count += 1
            if line_count % 200000 == 0:
                print(f"  Building bigrams: {line_count:,} lines, {len(bigrams):,} unique")
            
            words = line.split()
            if len(words) < 2:
                continue
            
            # Extract bigrams
            for i in range(len(words) - 1):
                w1, w2 = words[i], words[i+1]
                
                # Skip if any word not in vocab or is <unk>
                if (w1 not in vocab or w2 not in vocab or
                    w1 == '<unk>' or w2 == '<unk>'):
                    continue
                
                bigrams[w1][w2] += 1
    
    print(f"\nTotal bigrams before filtering: {len(bigrams):,}")
    
    # Filter rare bigrams
    filtered = {}
    for context, next_words in bigrams.items():
        filtered_next = {w: c for w, c in next_words.items() if c >= min_count}
        if filtered_next:
            filtered[context] = filtered_next

    print(f"After filtering (min_count={min_count}): {len(filtered):,}")

    return filtered


def build_common_words_list(word_freq, top_n=100):
    """Build list of most common words from word frequency dict"""
    
    print("\nBuilding list of most common words...")
    
    # Sort by frequency and take top N
    top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:top_n]
    common_words = [word for word, count in top_words]
    
    print(f"  Top 10 common words: {common_words[:10]}")
    
    return common_words


def build_sentence_starters(file_path, top_n=20):
    """Identify words that appear at the start of sentences"""
    
    print("\nIdentifying sentence starters...")
    
    starter_freq = defaultdict(int)
    line_count = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('='):
                continue
            
            line_count += 1
            if line_count % 200000 == 0:
                print(f"  Counting sentence starters: {line_count:,} lines")
            
            words = line.split()
            if not words:  # Safety check for empty lines
                continue
            
            first_word = words[0]
            
            # Skip <unk> tokens
            if first_word == '<unk>':
                continue
            
            starter_freq[first_word] += 1
    
    # Sort by frequency and take top N
    top_starters = sorted(starter_freq.items(), key=lambda x: x[1], reverse=True)[:top_n]
    starters = [word for word, count in top_starters]
    
    print(f"  Top 20 sentence starters: {starters[:20]}")
    
    return starters


def save_model(model, output_path):
    """Save model to file using pickle"""
    with open(output_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {output_path}")


def main():
    """Main training pipeline"""
    
    file_path = 'data/wikitext-103/wiki.train.tokens'
    
    print("-"*10)
    print("TRAINING N-GRAM TEXT PREDICTOR")
    print("-"*10)
    
    # Step 1: Build vocabulary (shared across all models)
    vocab, word_freq = build_vocabulary(file_path, max_vocab=30000)
    
    # Step 2: Build trigram model
    trigrams = build_trigram_model(file_path, vocab, min_count=5)
    save_model(trigrams, 'models/trigram_model.pkl')
    
    # Step 3: Build bigram model
    bigrams = build_bigram_model(file_path, vocab, min_count=5)
    save_model(bigrams, 'models/bigram_model.pkl')
    
    # Step 4: Build common words list (from word_freq we already have)
    common_words = build_common_words_list(word_freq, top_n=100)
    save_model(common_words, 'models/common_words.pkl')
    
    # Step 5: Build sentence starters
    starters = build_sentence_starters(file_path, top_n=20)
    save_model(starters, 'models/sentence_starters.pkl')
    
    print("\n" + "-"*10)
    print("TRAINING COMPLETE!")
    print("-"*10)
    print("\nModels created:")
    print("  - models/trigram_model.pkl")
    print("  - models/bigram_model.pkl")
    print("  - models/common_words.pkl")
    print("  - models/sentence_starters.pkl")


if __name__ == "__main__":
    main()