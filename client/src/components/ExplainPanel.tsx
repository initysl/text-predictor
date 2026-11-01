import React from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { formatPercent } from '../lib/format';
import { isPunctuation } from '../lib/text';
import { Prediction, PredictionSource } from '../types';
import Panel from './Panel';
import { CHAIN, SOURCES } from './sources';

interface ExplainPanelProps {
  source: PredictionSource | null;
  context: string[];
  predictions: Prediction[];
  stale: boolean;
}

const ExplainPanel: React.FC<ExplainPanelProps> = ({ source, context, predictions, stale }) => {
  if (!source) {
    return (
      <Panel title='Why these words' subtitle='How the model picked its suggestions'>
        <div className='space-y-3' aria-hidden>
          <div className='h-7 w-2/3 animate-pulse rounded-md bg-surface-2' />
          <div className='h-10 animate-pulse rounded-md bg-surface-2' />
          <div className='h-24 animate-pulse rounded-md bg-surface-2' />
        </div>
      </Panel>
    );
  }

  const meta = SOURCES[source];
  const activeStep = CHAIN.indexOf(source);
  const max = predictions[0]?.probability || 1;

  return (
    <Panel
      title='Why these words'
      subtitle='How the model picked its suggestions'
      action={
        <span className='flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-fg-2'>
          <span aria-hidden className={`size-2 rounded-full ${meta.swatch}`} />
          {meta.label}
        </span>
      }
    >
      <div className={`flex flex-1 flex-col gap-5 transition-opacity duration-150 ${stale ? 'opacity-60' : ''}`}>
        {/* Fallback chain */}
        {source === 'sentence_start' ? (
          <p className='text-xs text-fg-3'>N-gram lookup skipped at the start of a sentence.</p>
        ) : (
          <ol className='flex items-center gap-1 text-xs' aria-label='Fallback chain'>
            {CHAIN.map((step, i) => {
              const state = i < activeStep ? 'miss' : i === activeStep ? 'hit' : 'idle';
              return (
                <li key={step} className='flex items-center gap-1'>
                  {i > 0 && <LuChevronRight aria-hidden className='size-3 text-fg-3' />}
                  <span
                    className={`rounded-md px-2 py-1 font-medium ${
                      state === 'hit'
                        ? 'bg-surface-2 text-fg'
                        : state === 'miss'
                          ? 'text-fg-3 line-through decoration-fg-3/50'
                          : 'text-fg-3/60'
                    }`}
                  >
                    {SOURCES[step].label}
                    <span className='sr-only'>{state === 'miss' ? ' (no match)' : state === 'hit' ? ' (used)' : ''}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <p className='text-sm leading-relaxed text-fg-2'>{meta.description}</p>

        {/* Context the model conditioned on */}
        <div>
          <h3 className='mb-2 text-xs font-medium text-fg-3'>Context used</h3>
          <div className='flex flex-wrap items-center gap-1.5 font-mono text-sm'>
            {context.length > 0 ? (
              context.map((token, i) => (
                <span key={i} className='rounded-md border border-line bg-surface-2 px-2 py-0.5 text-fg'>
                  {token}
                </span>
              ))
            ) : (
              <span className='text-fg-3'>none</span>
            )}
            <span className='px-1 text-fg-3'>→</span>
            <span className='rounded-md border border-dashed border-fg-3/40 px-2 py-0.5 text-fg-3'>?</span>
          </div>
        </div>

        {/* Probability per candidate */}
        <div>
          <h3 className='mb-2 text-xs font-medium text-fg-3'>Probability of each next word</h3>
          <ul className='space-y-2'>
            {predictions.map((pred, i) => (
              <li
                key={`${i}-${pred.word}`}
                className='grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3 text-sm'
                title={`${pred.word}: ${formatPercent(pred.probability, 1)}`}
              >
                <span className={`truncate text-fg ${isPunctuation(pred.word) ? 'font-mono' : ''}`}>
                  {pred.word}
                </span>
                <span className='h-2 rounded-r-[4px] bg-transparent'>
                  <span
                    className={`block h-full rounded-r-[4px] ${meta.swatch} transition-[width] duration-300 ease-out`}
                    style={{ width: `${Math.max((pred.probability / max) * 100, 1.5)}%` }}
                  />
                </span>
                <span className='text-right font-mono text-xs text-fg-2 tabular-nums'>
                  {formatPercent(pred.probability)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
};

export default ExplainPanel;
