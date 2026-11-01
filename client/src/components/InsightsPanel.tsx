import React from 'react';
import { LuCloudOff } from 'react-icons/lu';
import { formatCount, formatPercent } from '../lib/format';
import { Stats } from '../types';
import Panel from './Panel';
import { CHAIN, SOURCES } from './sources';
import type { StatsStatus } from '../hooks/useModelStats';

interface InsightsPanelProps {
  stats: Stats | null;
  status: StatsStatus;
}

const Meter: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div
    role='meter'
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value * 1000) / 10}
    className='h-1.5 overflow-hidden rounded-full bg-track/60'
  >
    <div className='h-full rounded-full bg-trigram' style={{ width: `${value * 100}%` }} />
  </div>
);

const InsightsPanel: React.FC<InsightsPanelProps> = ({ stats, status }) => {
  if (status === 'offline') {
    return (
      <Panel title='Model insights' subtitle='Offline evaluation and model size'>
        <p className='flex flex-1 items-center justify-center gap-2 py-10 text-sm text-fg-3'>
          <LuCloudOff aria-hidden className='size-4' />
          Model stats are unavailable right now
        </p>
      </Panel>
    );
  }

  if (!stats) {
    return (
      <Panel title='Model insights' subtitle='Offline evaluation and model size'>
        <div className='space-y-3' aria-hidden>
          <div className='grid grid-cols-3 gap-2'>
            {[0, 1, 2].map((i) => (
              <div key={i} className='h-20 animate-pulse rounded-xl bg-surface-2' />
            ))}
          </div>
          <div className='h-16 animate-pulse rounded-md bg-surface-2' />
          <div className='h-24 animate-pulse rounded-md bg-surface-2' />
        </div>
      </Panel>
    );
  }

  const evaluation = stats.evaluation;
  const usage = evaluation?.fallback_usage ?? {};
  // Older evaluation runs called the unigram fallback "common"
  const mix = CHAIN.map((source) => ({
    source,
    count: usage[source] ?? (source === 'unigram' ? usage.common ?? 0 : 0),
  }));
  const mixTotal = mix.reduce((sum, m) => sum + m.count, 0);

  const facts = [
    { label: 'Trigram contexts', value: formatCount(stats.trigram_count) },
    { label: 'Bigram contexts', value: formatCount(stats.bigram_count) },
    { label: 'Vocabulary', value: `${formatCount(stats.vocabulary_size)} words` },
    { label: 'Size on disk', value: `${stats.model_size_mb} MB` },
  ];

  return (
    <Panel
      title='Model insights'
      subtitle={
        evaluation
          ? `WikiText-103 test set · ${formatCount(evaluation.total_predictions)} predictions`
          : 'Model size and vocabulary'
      }
    >
      <div className='flex flex-1 flex-col gap-6'>
        {evaluation && (
          <>
            <div>
              <h3 className='mb-2 text-xs font-medium text-fg-3'>Correct word within the top k suggestions</h3>
              <div className='grid grid-cols-3 gap-2'>
                {[1, 3, 5].map((k) => {
                  const value = evaluation.accuracies[`top_${k}`] ?? 0;
                  return (
                    <div key={k} className='rounded-xl bg-surface-2/70 p-3'>
                      <p className='text-xs text-fg-3'>Top-{k}</p>
                      <p className='mt-0.5 mb-2.5 text-xl font-semibold tracking-tight text-fg'>
                        {formatPercent(value, 1)}
                      </p>
                      <Meter value={value} label={`Top-${k} accuracy`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {mixTotal > 0 && (
              <div>
                <h3 className='mb-2 text-xs font-medium text-fg-3'>Which model answered</h3>
                <div
                  role='img'
                  aria-label={mix
                    .map((m) => `${SOURCES[m.source].label} ${formatPercent(m.count / mixTotal, 1)}`)
                    .join(', ')}
                  className='flex h-2 gap-[2px]'
                >
                  {mix.map(
                    (m) =>
                      m.count > 0 && (
                        <div
                          key={m.source}
                          title={`${SOURCES[m.source].label}: ${m.count.toLocaleString()} (${formatPercent(m.count / mixTotal, 1)})`}
                          className={`h-full rounded-full ${SOURCES[m.source].swatch}`}
                          style={{ width: `${(m.count / mixTotal) * 100}%` }}
                        />
                      ),
                  )}
                </div>
                <ul className='mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-fg-2'>
                  {mix.map((m) => (
                    <li key={m.source} className='flex items-center gap-1.5'>
                      <span aria-hidden className={`size-2 rounded-full ${SOURCES[m.source].swatch}`} />
                      {SOURCES[m.source].label}
                      <span className='font-mono text-fg-3 tabular-nums'>
                        {formatPercent(m.count / mixTotal, 1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className='mb-2 flex items-baseline justify-between'>
                <h3 className='text-xs font-medium text-fg-3'>Context coverage</h3>
                <span className='font-mono text-xs text-fg-2 tabular-nums'>
                  {formatPercent(evaluation.coverage, 1)}
                </span>
              </div>
              <Meter value={evaluation.coverage} label='Context coverage' />
              <p className='mt-1.5 text-xs text-fg-3'>Inputs where a trigram or bigram matched</p>
            </div>
          </>
        )}

        <dl className='mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4'>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className='text-xs text-fg-3'>{fact.label}</dt>
              <dd className='mt-0.5 text-sm font-medium text-fg'>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Panel>
  );
};

export default InsightsPanel;
