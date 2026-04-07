import pickle
import random
from predict import TextPredictor


def load_test_data(file_path, sample_size=10000):
    """Load and sample test data"""
    print(f"Loading test data from {file_path}...")
    
    test_sentences = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('='):
                continue
            
            words = line.split()
            # Need at least 3 words (2 for context, 1 to predict)
            if len(words) >= 3:
                test_sentences.append(words)
    
    print(f"Total test sentences: {len(test_sentences):,}")
    
    # Sample randomly if too many
    if len(test_sentences) > sample_size:
        test_sentences = random.sample(test_sentences, sample_size)
        print(f"Sampled: {len(test_sentences):,} sentences")
    
    return test_sentences


def evaluate_model(predictor, test_sentences, top_k_values=[1, 3, 5]):
    """
    Evaluate model accuracy on test data
    
    Args:
        predictor: TextPredictor instance
        test_sentences: List of tokenized sentences
        top_k_values: List of K values to test (e.g., [1, 3, 5])
    
    Returns:
        dict with evaluation metrics
    """
    print("\nEvaluating model...")
    
    total_predictions = 0
    correct_at_k = {k: 0 for k in top_k_values}
    fallback_counts = {'trigram': 0, 'bigram': 0, 'common': 0}
    
    max_k = max(top_k_values)
    
    for idx, sentence in enumerate(test_sentences):
        if idx % 1000 == 0:
            print(f"  Progress: {idx:,}/{len(test_sentences):,}")
        
        # For each sentence, test multiple predictions
        # Start from position 2 (need 2 words of context)
        for i in range(2, len(sentence)):
            # Context: all words up to position i
            context_words = sentence[:i]
            context_text = ' '.join(context_words)
            
            # Actual next word
            actual_word = sentence[i].lower()
            
            # Skip <unk> tokens in test
            if actual_word == '<unk>':
                continue
            
            # Get predictions
            result = predictor.predict_with_context(context_text, top_k=max_k)
            predictions = result['predictions']
            fallback_used = result['fallback_used']
            
            # Track fallback usage
            fallback_counts[fallback_used] = fallback_counts.get(fallback_used, 0) + 1
            
            # Extract predicted words
            predicted_words = [word for word, prob in predictions]
            
            # Check accuracy at different K values
            for k in top_k_values:
                if actual_word in predicted_words[:k]:
                    correct_at_k[k] += 1
            
            total_predictions += 1
    
    # Calculate accuracies
    accuracies = {}
    for k in top_k_values:
        accuracies[f'top_{k}'] = correct_at_k[k] / total_predictions if total_predictions > 0 else 0
    
    # Calculate coverage (how often we found context in models)
    coverage = (fallback_counts.get('trigram', 0) + fallback_counts.get('bigram', 0)) / total_predictions if total_predictions > 0 else 0
    
    results = {
        'total_predictions': total_predictions,
        'accuracies': accuracies,
        'fallback_usage': fallback_counts,
        'coverage': coverage
    }
    
    return results


def print_results(results):
    """Pretty print evaluation results"""
    print("\n" + "-"*60)
    print("EVALUATION RESULTS")
    print("-"*60)
    
    print(f"\nTotal predictions tested: {results['total_predictions']:,}")
    
    print("\nAccuracy by Top-K:")
    for metric, accuracy in sorted(results['accuracies'].items()):
        k = metric.split('_')[1]
        print(f"  Top-{k}: {accuracy:.2%}")
    
    print("\nFallback Strategy Usage:")
    total_fb = sum(results['fallback_usage'].values())
    for fallback, count in sorted(results['fallback_usage'].items()):
        pct = count / total_fb * 100 if total_fb > 0 else 0
        print(f"  {fallback.capitalize():10} : {count:,} ({pct:.1f}%)")
    
    print(f"\nModel Coverage: {results['coverage']:.2%}")
    print("(Percentage of contexts found in trigram or bigram models)")
    
    print("\n" + "-"*60)


def save_results(results, output_path='models/evaluation_results.pkl'):
    """Save evaluation results"""
    with open(output_path, 'wb') as f:
        pickle.dump(results, f)
    print(f"\nResults saved to {output_path}")


def main():
    """Run full evaluation"""
    
    # Load predictor
    print("Loading predictor...")
    predictor = TextPredictor()
    
    # Load test data
    test_sentences = load_test_data(
        'data/wikitext-103/wiki.test.tokens',
        sample_size=10000  # Adjust based on your patience
    )
    
    # Evaluate
    results = evaluate_model(
        predictor,
        test_sentences,
        top_k_values=[1, 3, 5]
    )
    
    # Print results
    print_results(results)
    
    # Save results
    save_results(results)
    
    print("\nEvaluation complete!")


if __name__ == "__main__":
    main()