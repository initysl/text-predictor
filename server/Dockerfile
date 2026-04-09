FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (layer caching)
COPY api/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api/ ./api/
COPY core/ ./core/

# Copy pre-trained models 
COPY models/ ./models/

# Railway provides PORT env variable
ENV PORT=8000

EXPOSE 8000

# Use Railway's PORT
CMD uvicorn api.main:app --host 0.0.0.0 --port $PORT