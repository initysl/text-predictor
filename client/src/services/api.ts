import axios from 'axios';
import { PredictionResponse, Stats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePredictionResponse = (data: unknown): PredictionResponse => {
  if (!isRecord(data)) {
    return {
      predictions: [],
      fallback_used: 'common',
      input_words: 0,
    };
  }

  const predictions = Array.isArray(data.predictions)
    ? data.predictions
        .map((prediction) => {
          if (Array.isArray(prediction)) {
            return {
              word:
                typeof prediction[0] === 'string' ? prediction[0] : '[unknown]',
              probability: toFiniteNumber(prediction[1], 0),
            };
          }

          if (isRecord(prediction)) {
            return {
              word:
                typeof prediction.word === 'string'
                  ? prediction.word
                  : '[unknown]',
              probability: toFiniteNumber(prediction.probability, 0),
            };
          }

          return {
            word: '[unknown]',
            probability: 0,
          };
        })
    : [];

  return {
    predictions,
    fallback_used:
      typeof data.fallback_used === 'string' ? data.fallback_used : 'common',
    input_words: toFiniteNumber(data.input_words, 0),
  };
};

const normalizeStats = (data: unknown): Stats => {
  if (!isRecord(data)) {
    return {
      trigram_count: 0,
      bigram_count: 0,
      common_words_count: 0,
      vocabulary_size: 0,
    };
  }

  return {
    trigram_count: toFiniteNumber(data.trigram_count, 0),
    bigram_count: toFiniteNumber(data.bigram_count, 0),
    common_words_count: toFiniteNumber(data.common_words_count, 0),
    vocabulary_size: toFiniteNumber(data.vocabulary_size, 0),
  };
};

export const predictNextWord = async (
  text: string,
  topK: number = 5,
): Promise<PredictionResponse> => {
  const response = await api.post<PredictionResponse>('/predict', {
    text,
    top_k: topK,
  });
  return normalizePredictionResponse(response.data);
};

export const getStats = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/stats');
  return normalizeStats(response.data);
};

export default api;
