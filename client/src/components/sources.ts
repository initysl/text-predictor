import { PredictionSource } from '../types';

export const SOURCES: Record<
  PredictionSource,
  { label: string; swatch: string; description: string }
> = {
  trigram: {
    label: 'Trigram',
    swatch: 'bg-trigram',
    description: 'The last two words appeared together in training, so the model knows what usually follows them.',
  },
  bigram: {
    label: 'Bigram',
    swatch: 'bg-bigram',
    description: "That word pair was never seen, so the model falls back to what follows the last word alone.",
  },
  unigram: {
    label: 'Unigram',
    swatch: 'bg-unigram',
    description: "The last word isn't in the 30k-word vocabulary, so these are simply the most common words overall.",
  },
  sentence_start: {
    label: 'Sentence start',
    swatch: 'bg-neutral',
    description: 'A new sentence is starting, so these are the most common ways Wikipedia sentences begin.',
  },
};

export const CHAIN: PredictionSource[] = ['trigram', 'bigram', 'unigram'];
