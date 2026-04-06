# Text Predictor

A text prediction model trained on the WikiText-103 dataset.

## Overview

This project implements an machine learning text predictor system. It analyzes sequences of words to predict the next word in a sentence. The model is trained on the WikiText-103 dataset, which contains a large corpus of text from Wikipedia articles.

## Features

- Build trigram models from text data
- Predict next words based on context
- Explore and analyze text datasets
- Web application for interactive predictions (planned)
- Unit tests for model validation

## Project Structure

```
text-predictor/
├── README.md
├── requirements.txt
├── app/
│   └── app.py                 # Web application (Flask/FastAPI)
├── data/
│   └── wikitext-103/          # WikiText-103 dataset
│       ├── wiki.train.tokens
│       ├── wiki.valid.tokens
│       └── wiki.test.tokens
├── models/                    # Trained models
├── src/
│   ├── train.py               # Model training script
│   ├── predict.py             # Prediction functions
│   ├── evaluate.py            # Model evaluation
│   └── explore.py             # Data exploration
└── tests/
    └── test_model.py          # Unit tests
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd text-predictor
   ```

2. Create a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Data Exploration

Explore the WikiText-103 dataset:

```bash
python src/explore.py
```

### Training the Model

Train the trigram model:

```bash
python src/train.py
```

This will generate a `trigram_model.pkl` file in the `models/` directory.

### Testing the Model

Run unit tests:

```bash
python -m pytest tests/
```

Or run the test script directly:

```bash
python tests/test_model.py
```

### Prediction

Use the prediction functions (`predict.py`):

```python
from src.predict import predict_next_word

context = ["The", "quick"]
next_word = predict_next_word(context)
print(next_word)
```

### Web Application

Run the web app (to be implemented in `app/app.py`):

```bash
python app/app.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
