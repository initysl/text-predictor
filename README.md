# Text Predictor

Real-time next-word prediction powered by n-gram language models trained on [WikiText-103](https://huggingface.co/datasets/Salesforce/wikitext) (about 100M tokens of Wikipedia). It uses counts rather than a neural network: you type, and the model suggests what usually comes next.

### Hey champ, appreciate you giving this work a star! 🌟

<!-- Screenshot: add docs/screenshot.png -->

## Features

- **Inline ghost text.** The top suggestion appears faded after your caret. Press `Tab` to accept it.
- **Keyboard-first suggestion bar.** Pick any of the top five with `Alt/⌥ + 1–5`, and press `Esc` to hide the ghost.
- **Smart spacing.** Punctuation and clitics (`,` `.` `'s` `n't`) attach to the previous word, and hyphens join words.
- **"Why these words" panel.** Shows which model answered (trigram, bigram or unigram fallback, or sentence start), the context tokens it matched, and the probability of each candidate.
- **Model insights.** Shows the offline top-k accuracy, which model answered how often, context coverage and model size.
- **Light and dark themes.** Follows your system setting, with a manual toggle.

## Quick start

### Docker

```bash
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:8000 (docs at `/docs`)

### Local

**Backend** (Python 3.10+):

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r api/requirements.txt
uvicorn api.main:app --reload            # http://localhost:8000
```

**Frontend** (Node 20+):

```bash
cd client
npm install
npm run dev                              # http://localhost:5173
```

In development, Vite proxies `/api` to `localhost:8000`. To point the client somewhere else, set `VITE_API_URL`. The server reads `CORS_ORIGINS` (comma-separated) from `server/.env`.

## How it works

### Tokenization

WikiText stores punctuation as separate tokens and writes in-word marks as `@-@`, `@,@` and `@.@`. The predictor tokenizes your input the same way before looking it up. For example, `state-of` becomes `state @-@ of` and `John's,` becomes `John 's ,`. Lookups try the exact case first, then lowercase, then Title case, so `new york` still finds `New York`.

### Fallback chain

| Step | Uses | When |
|---|---|---|
| Sentence start | Most common sentence openers | Empty input, or the text ends in `.` `!` `?` |
| Trigram | The last two tokens | The pair was seen in training |
| Bigram | The last token | The pair wasn't seen, but the token was |
| Unigram | Most common words overall | The token is outside the 30k vocabulary |

Probabilities are relative counts within the matched context. Fallback word lists that have no counts use rank-weighted (Zipf) probabilities.

### Evaluation

These results come from 229,189 predictions on a 10k-sentence sample of the WikiText-103 test set (`server/models/evaluation_results.pkl`):

| Metric | Value |
|---|---|
| Top-1 accuracy | 17.5% |
| Top-3 accuracy | 27.8% |
| Top-5 accuracy | 32.2% |
| Context coverage (trigram or bigram hit) | 89.5% |

## Project structure

```
text-predictor/
├── docker-compose.yml
├── server/
│   ├── api/                 # FastAPI app
│   │   ├── main.py          # /predict, /stats, /health
│   │   ├── models.py        # Model loader (MODEL_DIR overridable)
│   │   └── schemas.py       # Request/response models
│   ├── core/
│   │   ├── predict.py       # Tokenizer + prediction engine
│   │   ├── train.py         # Builds the n-gram tables
│   │   ├── evaluate.py      # Top-k accuracy on the test set
│   │   ├── explore.py       # Dataset statistics
│   │   └── cli.py           # Interactive terminal predictor
│   ├── models/              # Trained .pkl tables (~44 MB)
│   └── tests/               # pytest suite (uses small fixture models)
└── client/
    └── src/
        ├── components/      # Editor, SuggestionBar, ExplainPanel, InsightsPanel, …
        ├── hooks/           # usePredictions, useModelStats, useTheme
        ├── lib/             # API client, spacing rules, formatting
        └── types/
```

## API

| Endpoint | Description |
|---|---|
| `POST /predict` | Takes `{ "text": "...", "top_k": 5 }` (`top_k` from 1 to 10, `text` up to 2,000 chars). Returns `predictions`, `source`, `context` and `input_words`. |
| `GET /stats` | Context counts, vocabulary size, model size and evaluation results |
| `GET /health` | Model load status |

## Retraining and evaluation

Download WikiText-103 into `server/data/wikitext-103/`, then:

```bash
cd server
python core/train.py       # writes models/*.pkl (vocab size and min count are set in main())
python core/evaluate.py    # writes models/evaluation_results.pkl
python core/cli.py         # interactive terminal mode (needs colorama)
```

## Tests

```bash
cd server
pip install -r requirements-dev.txt
pytest -q
```

```bash
cd client
npm run lint && npm run build
```

## Known limitations

- The vocabulary is limited to 30k tokens, so rare words fall back to unigrams.
- The output has a formal, encyclopedic style, and the model knows no slang or recent language.
- The model only sees two tokens of context.

## License

MIT
