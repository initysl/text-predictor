import React, { useEffect, useRef } from 'react';
import { Prediction } from '../types';
import keyboard from '/keyboard.svg';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
  predictions: Prediction[];
  fallbackUsed: string;
  onSelectPrediction: (word: string) => void;
  loading?: boolean;
  focusKey?: number;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onClear,
  disabled = false,
  predictions,
  onSelectPrediction,
  loading = false,
  focusKey = 0,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const safeValue = typeof value === 'string' ? value : '';
  const safePredictions = Array.isArray(predictions) ? predictions : [];

  const getConfidenceColor = (probability: number): string => {
    if (probability >= 0.5)
      return 'bg-green-100 border-green-300 text-green-800';
    if (probability >= 0.2)
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled, focusKey]);

  return (
    <div className='bg-white rounded-2xl border-t border-b border-gray-200 p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-md font-semibold text-gray-800'>Your Text</h2>
        <button
          onClick={onClear}
          disabled={disabled || !safeValue}
          className='px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Clear
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder='Start typing here...'
        autoFocus
        className='w-full h-20 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-lg disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors'
      />

      <div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
        <span>{safeValue.split(/\s+/).filter(Boolean).length} words</span>
        <span>{safeValue.length} characters</span>
      </div>

      {/* Predictions Section */}
      <div className='mt-6 border-t border-gray-200 pt-6'>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <img
              src={keyboard}
              alt='Loading predictions'
              className='h-10 w-10 animate-pulse'
            />
          </div>
        ) : safePredictions.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p className='text-sm'>Start typing to see predictions</p>
          </div>
        ) : (
          <div className='flex justify-center flex-wrap gap-3'>
            {safePredictions.map((pred, index) => {
              const word =
                typeof pred?.word === 'string' ? pred.word : '[unknown]';
              const probability = Number.isFinite(pred?.probability)
                ? pred.probability
                : 0;
              const confidenceColor = getConfidenceColor(probability);

              return (
                <button
                  key={index}
                  onClick={() => onSelectPrediction(word)}
                  className={`border-2 rounded-full px-2 py-1 transition-all hover:scale-105 hover:shadow-md ${confidenceColor}`}
                >
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{word}</span>
                    <span className='text-xs font-medium opacity-70'>
                      {(probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInput;
