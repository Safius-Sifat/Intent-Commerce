.PHONY: help install dev build up down logs migrate shell test

help:
	@echo "Intent Commerce - Development Commands"
	@echo ""
	@echo "  make install    Install all dependencies (frontend + backend)"
	@echo "  make dev        Start all dev servers (requires infra running)"
	@echo "  make up         Start Docker infrastructure (postgres, redis, qdrant)"
	@echo "  make down       Stop Docker infrastructure"
	@echo "  make build      Build all Docker images"
	@echo "  make logs       Show logs from Docker infrastructure"
	@echo "  make migrate    Run database migrations"
	@echo "  make shell      Open backend shell inside poetry"
	@echo "  make test       Run backend tests"
	@echo ""

install:
	@echo "Installing frontend dependencies..."
	cd packages/shared && npm install && npm run build
	cd apps/frontend && npm install
	@echo "Installing backend dependencies..."
	cd apps/backend && poetry install

up:
	docker-compose up -d postgres redis qdrant

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f postgres redis qdrant

dev:
	@echo "Starting dev servers..."
	@echo "Make sure 'make up' was run first."
	tab1="cd apps/backend && poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
	tab2="cd apps/frontend && npm run dev"
	@echo "Run the following in separate terminals:"
	@echo "  Terminal 1: $$tab1"
	@echo "  Terminal 2: $$tab2"

migrate:
	cd apps/backend && poetry run alembic upgrade head

shell:
	cd apps/backend && poetry shell

test:
	cd apps/backend && poetry run pytest

setup:
	cp -n .env.example .env || true
	cp -n apps/frontend/.env.local.example apps/frontend/.env.local || true
	cp -n apps/backend/.env.example apps/backend/.env || true
	@echo "Environment files created. Please edit .env files with real API keys."
