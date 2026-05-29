# Agent Instructions: Intent Commerce

## Project Overview

Intent Commerce is a conversational multivendor e-commerce platform. The core interaction model is:
1. **Users** chat with an AI agent to discover products from multiple vendors
2. **Vendors** upload products and manage their business via an AI-powered dashboard
3. The **AI Agent** handles product search, recommendations, cart management, and checkout assistance

## Architecture Decisions

### Monorepo Layout
- `/apps/frontend` — Next.js 14, App Router, TypeScript, Tailwind, shadcn/ui
- `/apps/backend` — FastAPI, async everything, SQLAlchemy 2.0
- `/packages/shared` — TypeScript types and Zod schemas shared between frontend and backend
- Root orchestration via Docker Compose

### Why This Stack?
- **Next.js 14**: Server components for SEO (product pages), client components for chat interactivity
- **FastAPI**: Python ecosystem is mandatory for ML/AI libraries (LangChain, PyTorch, LightGBM)
- **LangGraph**: Shopping is a state machine (browse → cart → checkout). LangGraph handles loops and conditional branching that LangChain cannot.
- **pgvector + Qdrant**: pgvector for simple vector ops, Qdrant for high-performance hybrid retrieval at scale
- **Poetry**: Better dependency resolution than pip for complex ML stacks

### Critical Patterns

#### 1. Backend Layering (Strict)
```
API Layer (FastAPI routers)
  ↓ calls
Service Layer (Business logic, transactions)
  ↓ calls
Model Layer (SQLAlchemy ORM)
  ↓ calls
Database (PostgreSQL)
```
**Rule:** Agents import services. Services NEVER import agents.

#### 2. Conversation Persistence
Every chat interaction is persisted to `conversations` table with:
- `messages`: Full message array including tool calls and tool results
- `context_state`: Agent's working memory (budget, preferences, current cart snapshot)
- This enables cross-session continuity and analytics

#### 3. Cart as Source of Truth
The cart lives in PostgreSQL (`cart_items` table), not in the agent's memory.
- Agent can ADD to cart, but the web UI reads from the DB directly
- If user refreshes the page, cart is still there
- Agent queries `get_cart()` tool to know current state

#### 4. Inventory Check Before Display
Before showing ANY product to a user, the agent MUST call `check_inventory()`. If out of stock, the agent should say so and offer alternatives. The RAG vector DB might have stale stock data.

#### 5. Checkout Requires Explicit Confirmation
The agent can pre-fill checkout details, but NEVER execute payment without explicit user confirmation. The flow:
1. Agent proposes order summary
2. User confirms (says "yes", clicks button, etc.)
3. Backend creates order draft, holds inventory
4. Backend calls Stripe payment intent
5. On success, confirms order

## Build & Development

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- Python 3.11+
- Poetry (`pip install poetry`)

### Initial Setup
```bash
make setup      # Creates .env files
make install    # Installs all deps
make up         # Starts postgres, redis, qdrant
make migrate    # Runs alembic migrations
```

### Daily Development
```bash
# Terminal 1: Backend
cd apps/backend && poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd apps/frontend && npm run dev
```

### Docker (Alternative)
```bash
docker-compose up --build
```

## Testing

Run backend tests:
```bash
make test
```

Before committing:
1. Ensure `make up` services are healthy
2. Run migrations if you changed models
3. Update shared types if API contract changed
4. Never commit `.env` files

## Conventions

### Python
- Use `async`/`await` everywhere (FastAPI, SQLAlchemy, HTTP clients)
- Type hints are mandatory
- Pydantic v2 models for all API inputs/outputs
- Ruff for linting/formatting

### TypeScript
- Strict mode enabled
- Zod for runtime validation
- Shared package exports all types
- Components should be Server Components unless interactivity is needed

### Database
- Use `UUID` for all primary keys
- `created_at` / `updated_at` on every table
- JSONB for flexible attributes (product specs, addresses)
- Index foreign keys and frequently queried fields
- All schema changes via Alembic migrations

## Security Reminders
- JWT tokens for auth, never session cookies for API
- Stripe webhooks must verify signature
- File uploads: validate extensions, scan images, size limits
- Agent prompt injection: sanitize user inputs before passing to LLM system prompt
- SQL injection: use SQLAlchemy ORM, NEVER raw string interpolation
