# Text Predictor

An ML-powered next-word prediction application using N-gram language models trained on WikiText-103.

## Overview

This project implements a real-time text prediction system that suggests the next word as you type. Built with machine learning (N-gram models), it features a modern React frontend and FastAPI backend. The model is trained on WikiText-103, a high-quality dataset of Wikipedia articles containing over 100 million tokens.

## Project Structure

```
text-predictor/
│
├── server/                     # Python backend
│   ├── .venv/                  # Python virtual environment
│   ├── api/                    # FastAPI application
│   │   ├── main.py             # API endpoints
│   │   ├── schemas.py          # Request/response models
│   │   ├── models.py           # ML model loader
│   │   └── requirements.txt    # Python dependencies
│   ├── core/                   # Core ML logic
│   │   ├── train.py            # Model training script
│   │   ├── predict.py          # Prediction engine
│   │   ├── evaluate.py         # Model evaluation
│   │   └── cli.py              # Command-line interface
│   ├── models/                 # Trained models
│   │   ├── trigram_model.pkl
│   │   ├── bigram_model.pkl
│   │   ├── common_words.pkl
│   │   ├── sentence_starters.pkl
│   │   └── evaluation_results.pkl
│   └── data/                   # Training data
│       └── wikitext-103/
│           ├── wiki.train.tokens
│           ├── wiki.test.tokens
│           └── wiki.valid.tokens
│
└── client/                     # React frontend
    ├── node_modules/           # Node dependencies
    ├── src/
    │   ├── components/         # React components
    │   │   ├── Header.tsx
    │   │   ├── TextInput.tsx
    │   │   └── StatsPanel.tsx
    │   ├── services/           # API integration
    │   │   └── api.ts
    │   ├── types/              # TypeScript types
    │   │   └── index.ts
    │   ├── App.tsx             # Main app component
    │   ├── main.tsx            # Entry point
    │   └── index.css           # Global styles
    ├── public/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 18+
- pip & npm

### Backend Setup

Navigate to server directory:

```bash
cd server
```

Create virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

Install Python dependencies:

```bash
cd api
pip install -r requirements.txt
```

Download WikiText-103 dataset:

- Download from Hugging Face or Kaggle
- Extract to `server/data/wikitext-103/`

Train the models(can tune max_vocab and min count as desire):

```bash
cd ../core
python train.py
```

This will generate 4 model files in `server/models/`:

- `trigram_model.pkl` (~50-200 MB)
- `bigram_model.pkl` (~20-50 MB)
- `common_words.pkl` (~1 MB)
- `sentence_starters.pkl` (~1 MB)

### Frontend Setup

Navigate to client directory:

```bash
cd ../../client
```

Install Node dependencies:

```bash
npm install
```

## Usage

### Running the Application

**Terminal 1 - Start Backend:**

```bash
cd server/api
python main.py
```

Backend runs on: http://localhost:8000

**Terminal 2 - Start Frontend:**

```bash
cd client
npm run dev
```

Frontend runs on: http://localhost:5173

Open your browser and navigate to http://localhost:5173

### Command-Line Interface

Test predictions directly from terminal:

```bash
cd server/core
python cli.py
```

### Model Evaluation

Evaluate model accuracy on test data:

```bash
cd server/core
python evaluate.py
```

Expected metrics:

- Top-1 Accuracy: ~18% (first prediction correct)
- Top-3 Accuracy: ~35% (correct word in top 3)
- Top-5 Accuracy: ~42% (correct word in top 5)

API documentation: http://localhost:8000/docs

## Model Architecture

### Fallback Chain

- **Trigram ** - Uses last 2 words for prediction (highest accuracy)
- **Bigram ** - Falls back to last 1 word if trigram not found
- **Common Words ** - Returns most frequent words as last resort
- **Sentence Starters ** - Special case for empty input

### Training Details

- Dataset: WikiText-103 (~100M tokens)
- Vocabulary: 30,000 most common words
- Min frequency: 5 occurrences
- Training time: ~10-15 minutes on 8GB RAM
- Model size: ~70-250 MB total

## Known Limitations

- Limited to 30k vocabulary (rare words not recognized)
- Formal writing style (trained on Wikipedia)
- No slang or modern internet language
- Cannot understand long-term context (only last 2 words)
- Case-insensitive (all predictions lowercase)

## Future Improvements

- Emoji predictions

## License

This project is licensed under the MIT License

Made with love!.
