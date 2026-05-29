# Intent Commerce

A conversational, AI-powered multivendor e-commerce platform. Users discover and purchase products through natural language conversations with an agentic system. Vendors manage products and access AI-driven analytics and demand forecasting through an intelligent dashboard.

## Quick Start

Requires: Docker, Docker Compose, Node.js 20+, Python 3.11+

```bash
# 1. Clone and enter directory
cd intent-commerce

# 2. Copy environment files
cp .env.example .env
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env

# 3. Start infrastructure services
docker-compose up -d postgres redis qdrant

# 4. Install frontend dependencies and shared package
cd packages/shared && npm install && npm run build && cd ../..
cd apps/frontend && npm install && cd ../..

# 5. Install backend dependencies (with Poetry)
cd apps/backend && poetry install && cd ../..

# 6. Run database migrations
cd apps/backend && poetry run alembic upgrade head && cd ../..

# 7. Start development servers
make dev
```

Or use Docker for everything:
```bash
docker-compose up --build
```

## Monorepo Structure

```
intent-commerce/
├── apps/
│   ├── frontend/          # Next.js 14 + Tailwind + shadcn/ui + Vercel AI SDK
│   └── backend/           # FastAPI + LangGraph + SQLAlchemy + Forecasting
├── packages/
│   └── shared/            # Shared TypeScript types and Zod schemas
├── infra/
│   ├── nginx/             # Reverse proxy config
│   └── postgres/          # Init scripts and extensions
├── docker-compose.yml     # Local orchestration
├── Makefile               # Common commands
└── task-distribution.md   # Team responsibilities
```

## Team Roles

See `task-distribution.md` for detailed module ownership and sprint planning.

## Environment Variables

Copy `.env.example` to `.env` and fill in values before starting.

### Required Services

- **PostgreSQL 16** (with pgvector extension)
- **Redis 7** (sessions, caching, Celery broker)
- **Qdrant** (vector search for multimodal embeddings)
- **Nginx** (reverse proxy in production)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK |
| Backend API | FastAPI, Pydantic, SQLAlchemy 2.0, Alembic, Asyncpg |
| AI/LLM | LangGraph, LangChain, OpenAI/Claude APIs |
| Embeddings | BGE-M3 (text), SigLIP (image), Qdrant (vector DB) |
| Forecasting | Prophet, LightGBM, NeuralForecast |
| Payments | Stripe |
| Deployment | Docker, Docker Compose |

## License

Internal project.
