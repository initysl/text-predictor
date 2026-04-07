import React from 'react';
import { Prediction } from '../types';

interface PredictionListProps {
  predictions: Prediction[];
  fallbackUsed: string;
  onSelect: (word: string) => void;
  loading?: boolean;
}

const PredictionList: React.FC<PredictionListProps> = ({
  predictions,
  fallbackUsed,
  onSelect,
  loading = false,
}) => {
  const getConfidenceColor = (probability: number): string => {
    if (probability >= 0.5)
      return 'bg-green-100 border-green-300 text-green-800';
    if (probability >= 0.2)
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const getFallbackBadge = () => {
    const badges = {
      trigram: {
        emoji: '🎯',
        text: 'Trigram',
        color: 'bg-purple-100 text-purple-800',
      },
      bigram: {
        emoji: '🎲',
        text: 'Bigram',
        color: 'bg-blue-100 text-blue-800',
      },
      common: {
        emoji: '📚',
        text: 'Common',
        color: 'bg-gray-100 text-gray-800',
      },
      empty: {
        emoji: '✨',
        text: 'Starter',
        color: 'bg-pink-100 text-pink-800',
      },
    };

    const badge = badges[fallbackUsed as keyof typeof badges] || badges.common;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
      >
        <span className='mr-1'>{badge.emoji}</span>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold text-gray-800'>Predictions</h2>
        {getFallbackBadge()}
      </div>

      {predictions.length === 0 ? (
        <div className='text-center py-12 text-gray-500'>
          <span className='text-4xl mb-4 block'>👆</span>
          <p>Start typing to see predictions</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {predictions.map((pred, index) => {
            const confidenceColor = getConfidenceColor(pred.probability);
            const barWidth = `${pred.probability * 100}%`;

            return (
              <button
                key={index}
                onClick={() => onSelect(pred.word)}
                className={`w-full text-left border-2 rounded-lg p-4 transition-all hover:scale-105 hover:shadow-md ${confidenceColor}`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-lg font-semibold'>
                    {index + 1}. {pred.word}
                  </span>
                  <span className='text-sm font-bold'>
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className='w-full bg-white bg-opacity-50 rounded-full h-2'>
                  <div
                    className='bg-current h-2 rounded-full transition-all duration-300'
                    style={{ width: barWidth }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PredictionList;
