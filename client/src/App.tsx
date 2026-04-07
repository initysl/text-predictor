import { useState, useEffect } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import PredictionList from './components/PredictionList';
import StatsPanel from './components/StatsPanel';
import { predictNextWord } from './services/api';
import { Prediction } from './types';

function App() {
  const [text, setText] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [fallbackUsed, setFallbackUsed] = useState('empty');
  const [loading, setLoading] = useState(false);
  const [predictionsMode, setPredictionsMode] = useState(0);
  const [topAccepted, setTopAccepted] = useState(0);

  // Fetch predictions when text changes
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!text.trim()) {
        setPredictions([]);
        setFallbackUsed('empty');
        return;
      }

      setLoading(true);
      try {
        const result = await predictNextWord(text, 5);
        setPredictions(result.predictions);
        setFallbackUsed(result.fallback_used);
        setPredictionsMode((prev) => prev + 1);
      } catch (error) {
        console.error('Prediction error:', error);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [text]);

  const handleSelectPrediction = (word: string) => {
    const newText = text.trim() ? `${text} ${word}` : word;
    setText(newText);

    // Track if top prediction was accepted
    if (predictions.length > 0 && predictions[0].word === word) {
      setTopAccepted((prev) => prev + 1);
    }
  };

  const handleClearText = () => {
    setText('');
    setPredictions([]);
    setFallbackUsed('empty');
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      <main className='flex-1 container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column: Text Input (2/3 width on large screens) */}
          <div className='lg:col-span-2 space-y-6'>
            <TextInput
              value={text}
              onChange={setText}
              onClear={handleClearText}
              disabled={loading}
            />

            {/* Predictions (show below input on mobile, stays with input on desktop) */}
            <div className='lg:hidden'>
              <PredictionList
                predictions={predictions}
                fallbackUsed={fallbackUsed}
                onSelect={handleSelectPrediction}
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column: Predictions & Stats */}
          <div className='space-y-6'>
            {/* Predictions (desktop only) */}
            <div className='hidden lg:block'>
              <PredictionList
                predictions={predictions}
                fallbackUsed={fallbackUsed}
                onSelect={handleSelectPrediction}
                loading={loading}
              />
            </div>

            {/* Stats Panel */}
            <StatsPanel
              predictionsMode={predictionsMode}
              topAccepted={topAccepted}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-white border-t border-gray-200 mt-8'>
        <div className='container mx-auto px-4 py-6 text-center text-gray-600 text-sm'>
          <p>
            Built with React + TypeScript + FastAPI | Trained on WikiText-103
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
