def explore_data(file_path):
    """Analyze WikiText training data."""

    total_lines = 0
    total_words = 0
    word_freq = {}

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()

            # Skip empty lines and section headers
            if not line or line.startswith('='):
                continue

            total_lines += 1
            words = line.split()
            total_words += len(words)

            # Count word frequencies
            for word in words:
                word_freq[word] = word_freq.get(word, 0) + 1

    # Get top 20 most common words
    top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:20]

    print(f"Total lines of data: {total_lines}")
    print(f"Total words in data: {total_words}")
    print(f"Unique words: {len(word_freq):,}")
    print(f"\nTop 20 most common words:")
    for word, count in top_words:
        print(f"{word}: {count}")
    
    return word_freq


if __name__ == "__main__":
    explore_data("data/wikitext-103/wiki.train.tokens")