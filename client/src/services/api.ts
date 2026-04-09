import axios from 'axios';
import { PredictionResponse, Stats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictNextWord = async (
  text: string,
  topK: number = 5,
): Promise<PredictionResponse> => {
  const response = await api.post<PredictionResponse>('/predict', {
    text,
    top_k: topK,
  });
  return response.data;
};

export const getStats = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/stats');
  return response.data;
};

export default api;
