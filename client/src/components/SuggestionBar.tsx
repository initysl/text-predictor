import React from 'react';
import { LuCloudOff } from 'react-icons/lu';
import { formatPercent } from '../lib/format';
import { isPunctuation } from '../lib/text';
import { Prediction } from '../types';
import Kbd from './Kbd';

interface SuggestionBarProps {
  predictions: Prediction[];
  stale: boolean;
  error: boolean;
  onSelect: (index: number) => void;
}

const SuggestionBar: React.FC<SuggestionBarProps> = ({ predictions, stale, error, onSelect }) => {
  const top = predictions[0]?.probability || 1;

  return (
    <div className='border-t border-line bg-surface-2/50 px-3 py-3 sm:px-5'>
      <div aria-live='polite' className='sr-only'>
        {predictions.length > 0 && !stale
          ? `Suggestions: ${predictions.map((p) => p.word).join(', ')}`
          : ''}
      </div>

      {error && predictions.length === 0 ? (
        <p className='flex h-11 items-center justify-center gap-2 text-sm text-fg-3'>
          <LuCloudOff aria-hidden className='size-4' />
          Can't reach the prediction server
        </p>
      ) : predictions.length === 0 ? (
        <div className='flex h-11 items-center gap-2' aria-hidden>
          {[72, 56, 64, 48, 60].map((w, i) => (
            <div key={i} className='h-9 animate-pulse rounded-lg bg-surface-2' style={{ width: w }} />
          ))}
        </div>
      ) : (
        <ul
          className={`flex gap-2 overflow-x-auto [scrollbar-width:none] transition-opacity duration-150 ${stale ? 'opacity-55' : ''}`}
          aria-label='Next-word suggestions'
        >
          {predictions.map((pred, index) => {
            const primary = index === 0;
            return (
              <li key={`${index}-${pred.word}`} className='animate-rise shrink-0' style={{ animationDelay: `${index * 25}ms` }}>
                <button
                  type='button'
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(index)}
                  aria-keyshortcuts={primary ? 'Tab Alt+1' : `Alt+${index + 1}`}
                  title={`${(pred.probability * 100).toFixed(1)}% likely`}
                  className={`group relative flex h-11 items-center gap-2.5 overflow-hidden rounded-lg border pr-3 pl-2 text-left transition-[transform,background-color,border-color] duration-150 active:scale-[0.97] ${
                    primary
                      ? 'border-accent/30 bg-accent-soft hover:border-accent/50'
                      : 'border-line bg-surface hover:border-fg-3/40 hover:bg-surface'
                  }`}
                >
                  <Kbd>{primary ? '⇥' : `⌥${index + 1}`}</Kbd>
                  <span
                    className={`text-[15px] font-medium text-fg ${isPunctuation(pred.word) ? 'min-w-3 text-center font-mono' : ''}`}
                  >
                    {pred.word}
                  </span>
                  <span className='font-mono text-[11px] text-fg-3 tabular-nums'>
                    {formatPercent(pred.probability)}
                  </span>
                  {/* Relative confidence, scaled to the top suggestion */}
                  <span
                    aria-hidden
                    className='absolute bottom-0 left-0 h-[2px] rounded-r-full bg-accent/60 transition-[width] duration-300'
                    style={{ width: `${(pred.probability / top) * 100}%` }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SuggestionBar;
