export type PredictionSource = 'trigram' | 'bigram' | 'unigram' | 'sentence_start';

export interface Prediction {
  word: string;
  probability: number;
}

export interface PredictionResponse {
  predictions: Prediction[];
  source: PredictionSource;
  context: string[];
  input_words: number;
}

export interface Evaluation {
  total_predictions: number;
  accuracies: Record<string, number>;
  fallback_usage: Record<string, number>;
  coverage: number;
}

export interface Stats {
  trigram_count: number;
  bigram_count: number;
  common_words_count: number;
  vocabulary_size: number;
  model_size_mb: number;
  evaluation: Evaluation | null;
}
