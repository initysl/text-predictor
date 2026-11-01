import { useCallback, useState } from 'react';
import Editor from './components/Editor';
import ExplainPanel from './components/ExplainPanel';
import Footer from './components/Footer';
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
    <div className='flex min-h-screen flex-col'>
      <Header online={online} theme={preference} onCycleTheme={cycle} />

      <main className='mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-16 sm:pt-14'>
        <div className='mb-6 sm:mb-8'>
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
        >
          <SuggestionBar
            predictions={predictions}
            stale={!fresh && slow}
            error={status === 'error'}
            onSelect={handleAccept}
          />
        </Editor>

        <div className='mt-6 grid gap-6 md:grid-cols-2'>
          <ExplainPanel
            source={source}
            context={context}
            predictions={predictions}
            stale={!fresh && slow}
          />
          <InsightsPanel stats={stats} status={statsStatus} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
