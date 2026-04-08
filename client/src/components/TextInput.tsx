import React from 'react';
import { Prediction } from '../types';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
  predictions: Prediction[];
  fallbackUsed: string;
  onSelectPrediction: (word: string) => void;
  loading?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onClear,
  disabled = false,
  predictions,
  // fallbackUsed,
  onSelectPrediction,
  loading = false,
}) => {
  const getConfidenceColor = (probability: number): string => {
    if (probability >= 0.5)
      return 'bg-green-100 border-green-300 text-green-800';
    if (probability >= 0.2)
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  // const getFallbackBadge = () => {
  //   const badges = {
  //     trigram: {
  //       emoji: '🎯',
  //       text: 'Trigram',
  //       color: 'bg-purple-100 text-purple-800',
  //     },
  //     bigram: {
  //       emoji: '🎲',
  //       text: 'Bigram',
  //       color: 'bg-blue-100 text-blue-800',
  //     },
  //     common: {
  //       emoji: '📚',
  //       text: 'Common',
  //       color: 'bg-gray-100 text-gray-800',
  //     },
  //     empty: {
  //       emoji: '✨',
  //       text: 'Starter',
  //       color: 'bg-pink-100 text-pink-800',
  //     },
  //   };

  //   const badge = badges[fallbackUsed as keyof typeof badges] || badges.common;

  //   return (
  //     <span
  //       className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
  //     >
  //       <span className='mr-1'>{badge.emoji}</span>
  //       {badge.text}
  //     </span>
  //   );
  // };

  return (
    <div className='bg-white rounded-2xl border-t border-b border-gray-200 p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-md font-semibold text-gray-800'>Your Text</h2>
        <button
          onClick={onClear}
          disabled={disabled || !value}
          className='px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Clear
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder='Start typing here...'
        className='w-full h-20 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-lg disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors'
      />

      <div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
        <span>{value.split(/\s+/).filter(Boolean).length} words</span>
        <span>{value.length} characters</span>
      </div>

      {/* Predictions Section - Right below character count */}
      <div className='mt-6 border-t border-gray-200 pt-6'>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600'></div>
          </div>
        ) : predictions.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <p className='text-sm'>Start typing to see predictions</p>
          </div>
        ) : (
          <div className='flex justify-center flex-wrap gap-3'>
            {predictions.map((pred, index) => {
              const confidenceColor = getConfidenceColor(pred.probability);

              return (
                <button
                  key={index}
                  onClick={() => onSelectPrediction(pred.word)}
                  className={`border-2 rounded-full px-2 py-1 transition-all hover:scale-105 hover:shadow-md ${confidenceColor}`}
                >
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{pred.word}</span>
                    <span className='text-xs font-medium opacity-70'>
                      {(pred.probability * 100).toFixed(0)}%
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
