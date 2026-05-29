FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (for torch, pillow, lightgbm, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install --no-cache-dir poetry

# Copy dependency files
COPY apps/backend/pyproject.toml ./

# Install dependencies (without creating a virtualenv inside Docker)
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Copy source code
COPY apps/backend/src ./src
COPY apps/backend/alembic.ini ./

# Create alembic versions directory if not exists
RUN mkdir -p src/migrations/versions

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
