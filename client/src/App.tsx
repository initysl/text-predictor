import { useCallback, useState } from 'react';
import Editor from './components/Editor';
import ExplainPanel from './components/ExplainPanel';
import Header from './components/Header';
import InsightsPanel from './components/InsightsPanel';
import SuggestionBar from './components/SuggestionBar';
import { useModelStats } from './hooks/useModelStats';
import { usePredictions } from './hooks/usePredictions';
import { useTheme } from './hooks/useTheme';
import { applyPrediction } from './lib/text';

function App() {
  const [text, setText] = useState('');
  const [focusKey, setFocusKey] = useState(0);

  const { predictions, source, context, forText, status, slow } = usePredictions(text);
  const { stats, status: statsStatus } = useModelStats();
  const { preference, cycle } = useTheme();

  const fresh = forText === text && status === 'ready';
  const online =
    status === 'error' || statsStatus === 'offline'
      ? false
      : statsStatus === 'online' || status === 'ready'
        ? true
        : null;

  const handleAccept = useCallback(
    (index: number) => {
      const prediction = predictions[index];
      if (!prediction) return;
      setText((current) => applyPrediction(current, prediction.word));
      setFocusKey((k) => k + 1);
    },
    [predictions],
  );

  const handleClear = () => {
    setText('');
    setFocusKey((k) => k + 1);
  };

  return (
    // On xl screens everything fits one viewport; smaller screens scroll
    <div className='flex min-h-dvh flex-col xl:h-dvh xl:min-h-[600px]'>
      <Header online={online} theme={preference} onCycleTheme={cycle} />

      <main className='mx-auto grid w-full max-w-3xl flex-1 gap-6 px-4 pt-10 pb-16 sm:pt-14 md:grid-cols-2 xl:my-auto xl:max-h-[800px] xl:min-h-0 xl:max-w-7xl xl:grid-cols-[minmax(0,1fr)_340px_340px] xl:gap-5 xl:px-6 xl:py-6 2xl:max-w-[1440px] 2xl:grid-cols-[minmax(0,1fr)_380px_380px]'>
        <div className='flex min-w-0 flex-col md:col-span-2 xl:col-span-1 xl:min-h-0'>
        <div className='mb-6 sm:mb-8 xl:mb-5'>
          <h1 className='text-2xl font-semibold tracking-tight text-balance text-fg sm:text-3xl'>
            Start a sentence. The model finishes it.
          </h1>
          <p className='mt-2 max-w-xl text-sm leading-relaxed text-pretty text-fg-2 sm:text-[15px]'>
            Next-word suggestions from trigram and bigram statistics over 100 million words of
            Wikipedia, with no neural network involved.
          </p>
        </div>

        <Editor
          value={text}
          onChange={setText}
          onAccept={handleAccept}
          onClear={handleClear}
          topWord={fresh ? (predictions[0]?.word ?? null) : null}
          suggestionCount={predictions.length}
          focusKey={focusKey}
          className='xl:min-h-0 xl:flex-1'
        >
          <SuggestionBar
            predictions={predictions}
            stale={!fresh && slow}
            error={status === 'error'}
            onSelect={handleAccept}
          />
        </Editor>
        </div>

        <ExplainPanel
          source={source}
          context={context}
          predictions={predictions}
          stale={!fresh && slow}
        />
        <InsightsPanel stats={stats} status={statsStatus} />
      </main>
    </div>
  );
}

export default App;
