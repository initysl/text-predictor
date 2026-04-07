export interface Prediction {
  word: string;
  probability: number;
}

export interface PredictionResponse {
  predictions: Prediction[];
  fallback_used: string;
  input_words: number;
}

export interface Stats {
  trigram_count: number;
  bigram_count: number;
  common_words_count: number;
  vocabulary_size: number;
}
