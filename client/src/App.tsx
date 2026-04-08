import { useState, useEffect } from 'react';
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
  const [predictionsMode, setPredictionsMode] = useState(0);
  const [topAccepted, setTopAccepted] = useState(0);

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

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [text]);

  const handleSelectPrediction = (word: string) => {
    const newText = text.trim() ? `${text} ${word}` : word;
    setText(newText);

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

      <main className='flex-1 container mx-auto p-4'>
        <div className='space-y-6 max-w-4xl mx-auto'>
          {/* Combined: Text Input + Predictions */}
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
            predictionsMode={predictionsMode}
            topAccepted={topAccepted}
          />
        </div>
      </main>

      <footer className='bg-white border-t border-gray-200 mt-8'>
        <div className='container mx-auto p-4 text-center text-gray-600 text-sm'>
          <p>| Trained on WikiText-103 |</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
