import { PredictionResponse, Stats } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

// The n-gram model only looks at the last two tokens, so the tail is enough
const MAX_CONTEXT_CHARS = 500;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export const predictNextWord = (
  text: string,
  topK = 5,
  signal?: AbortSignal,
): Promise<PredictionResponse> =>
  request<PredictionResponse>('/predict', {
    method: 'POST',
    body: JSON.stringify({ text: text.slice(-MAX_CONTEXT_CHARS), top_k: topK }),
    signal,
  });

export const getStats = (): Promise<Stats> => request<Stats>('/stats');
