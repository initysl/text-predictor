import { useEffect, useState } from 'react';
import { predictNextWord } from '../lib/api';
import { Prediction, PredictionSource } from '../types';

const DEBOUNCE_MS = 120;
const LOADING_DELAY_MS = 200;

export type PredictionStatus = 'loading' | 'ready' | 'error';

export interface PredictionState {
  predictions: Prediction[];
  source: PredictionSource | null;
  context: string[];
  /** The text these predictions were made for; differs from the input while typing */
  forText: string | null;
  status: PredictionStatus;
  /** True only once a request has been slow, to avoid flicker */
  slow: boolean;
}

const initialState: PredictionState = {
  predictions: [],
  source: null,
  context: [],
  forText: null,
  status: 'loading',
  slow: false,
};

export function usePredictions(text: string, topK = 5): PredictionState {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const controller = new AbortController();
    let slowTimer: ReturnType<typeof setTimeout> | undefined;

    const debounceTimer = setTimeout(async () => {
      slowTimer = setTimeout(() => setState((s) => ({ ...s, slow: true })), LOADING_DELAY_MS);
      setState((s) => ({ ...s, status: 'loading' }));

      try {
        const result = await predictNextWord(text, topK, controller.signal);
        setState({
          predictions: result.predictions,
          source: result.source,
          context: result.context,
          forText: text,
          status: 'ready',
          slow: false,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Prediction error:', error);
        setState((s) => ({ ...s, status: 'error', slow: false }));
      } finally {
        clearTimeout(slowTimer);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(debounceTimer);
      clearTimeout(slowTimer);
    };
  }, [text, topK]);

  return state;
}
