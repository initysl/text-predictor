import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import StatsPanel from './components/StatsPanel';
import { predictNextWord } from './services/api';
import { Prediction } from './types';

function App() {
  const [text, setText] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [fallbackUsed, setFallbackUsed] = useState('empty');
  const [loading, setLoading] = useState(false);
  const [predictionsCount, setPredictionsCount] = useState(0);
  const [topAccepted, setTopAccepted] = useState(0);

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!text.trim()) {
      setPredictions([]);
      setFallbackUsed('empty');
      setLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    let isActive = true;

    const fetchPredictions = async () => {
      // Delay showing loading to avoid flicker
      const loadingTimeout = setTimeout(() => {
        if (isActive) setLoading(true);
      }, 150);

      try {
        const result = await predictNextWord(text, 5);

        // Ignore stale responses
        if (!isActive || currentRequestId !== requestIdRef.current) return;

        setPredictions(result.predictions);
        setFallbackUsed(result.fallback_used);
        setPredictionsCount((prev) => prev + 1);
      } catch (error) {
        console.error('Prediction error:', error);
        if (isActive) setPredictions([]);
      } finally {
        clearTimeout(loadingTimeout);
        if (isActive) setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchPredictions, 300);

    return () => {
      isActive = false;
      clearTimeout(debounceTimeout);
    };
  }, [text]);

  const handleSelectPrediction = useCallback(
    (word: string) => {
      const newText = text.trim() ? `${text} ${word}` : word;
      setText(newText);

      if (predictions.length > 0 && predictions[0].word === word) {
        setTopAccepted((prev) => prev + 1);
      }
    },
    [text, predictions],
  );

  const handleClearText = () => {
    setText('');
    setPredictions([]);
    setFallbackUsed('empty');
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      <main className='flex-1 container mx-auto px-4 py-8'>
        <div className='space-y-6 max-w-4xl mx-auto'>
          {/*Text Input + Predictions */}
          <TextInput
            value={text}
            onChange={setText}
            onClear={handleClearText}
            disabled={loading}
            predictions={predictions}
            fallbackUsed={fallbackUsed}
            onSelectPrediction={handleSelectPrediction}
            loading={loading}
          />

          {/* Stats Panel */}
          <StatsPanel
            predictionsMode={predictionsCount}
            topAccepted={topAccepted}
          />
        </div>
      </main>

      <footer className='bg-white border-t border-gray-200 '>
        <div className='container mx-auto px-4 py-6 text-center text-gray-600 text-sm '>
          <p>| Trained on WikiText-103 |</p>
        </div>
        <div>
          <a href='' className='text-gray-600 text-sm hover:underline'>
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
