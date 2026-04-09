import React, { useEffect, useState } from 'react';
import { getStats } from '../services/api';
import { Stats } from '../types';

interface StatsPanelProps {
  predictionsMode: number;
  topAccepted: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  predictionsMode,
  topAccepted,
}) => {
  const [modelStats, setModelStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await getStats();
      setModelStats(stats);
      setStatsError(false);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStatsError(true);
    }
  };

  const formatCount = (value: unknown) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue.toLocaleString() : '--';
  };

  const accuracy =
    predictionsMode > 0
      ? ((topAccepted / predictionsMode) * 100).toFixed(1)
      : '0.0';

  return (
    <div className='bg-white rounded-2xl border-t border-b border-gray-200 p-6'>
      <h2 className='text-md font-semibold text-gray-800 mb-6'>Stats</h2>

      {/* Session Stats */}
      <div className='mb-6'>
        <div className='grid grid-cols-3 gap-3'>
          <div className='bg-purple-50 rounded-lg p-4'>
            <p className='text-sm text-gray-600'>Predictions Made</p>
            <p className='text-3xl font-bold text-purple-600'>
              {predictionsMode}
            </p>
          </div>

          <div className='bg-blue-50 rounded-lg p-4'>
            <p className='text-sm text-gray-600'>Top-1 Accepted</p>
            <p className='text-3xl font-bold text-blue-600'>{topAccepted}</p>
          </div>

          <div className='bg-green-50 rounded-lg p-4'>
            <p className='text-sm text-gray-600'>Accuracy</p>
            <p className='text-3xl font-bold text-green-600'>{accuracy}%</p>
          </div>
        </div>
      </div>

      {/* Model Stats */}
      {modelStats && (
        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-3'>
            Model Info
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Trigrams:</span>
              <span className='font-semibold'>
                {formatCount(modelStats.trigram_count)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Bigrams:</span>
              <span className='font-semibold'>
                {formatCount(modelStats.bigram_count)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Vocabulary:</span>
              <span className='font-semibold'>
                {formatCount(modelStats.vocabulary_size)}
              </span>
            </div>
          </div>
        </div>
      )}

      {statsError && (
        <p className='text-sm text-red-600'>
          Model stats are unavailable right now.
        </p>
      )}
    </div>
  );
};

export default StatsPanel;
