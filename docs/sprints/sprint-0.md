# Sprint 0: Foundation

**Duration:** Week 1  
**Goal:** All developers can run the full stack locally with hot reload. Database schema is created. Basic project structure is validated.

## Sprint 0 Overview

This sprint establishes the development environment and validates that the monorepo structure works end-to-end. No user-facing features are built. The output is a working local development environment where every team member can start their services and see data flow through the system.

---

## Stories

### S0-P5-001: Docker Compose Infrastructure

**As a** developer  
**I want** to start all infrastructure services with a single command  
**So that** I don't need to manually install PostgreSQL, Redis, or Qdrant

#### Acceptance Criteria
- **Given** a fresh clone of the repository
- **When** I run `docker-compose up -d postgres redis qdrant`
- **Then** all three services start successfully within 30 seconds
- **And** PostgreSQL has pgvector extension enabled
- **And** Qdrant is accessible at http://localhost:6333/dashboard
- **And** Redis responds to `PING` with `PONG`

#### Technical Notes
- Use `ankane/pgvector:latest` for PostgreSQL
- Use `redis:7-alpine` for Redis
- Use `qdrant/qdrant:latest` for Qdrant
- Add healthchecks to all services
- Create persistent Docker volumes for data

#### Dependencies
- None

#### Assigned To
- Person 5 (DevOps)

#### Estimation
- 4 hours

---

### S0-P5-002: Backend Docker Hot Reload

**As a** backend developer  
**I want** changes to Python code to automatically reload the FastAPI server  
**So that** I don't need to rebuild the Docker image on every change

#### Acceptance Criteria
- **Given** the backend service is running via Docker Compose
- **When** I modify any `.py` file in `apps/backend/src/`
- **Then** uvicorn reloads within 2 seconds
- **And** the new code is active without manual restart

#### Technical Notes
- Mount source code as volume in Dockerfile
- Use `poetry run uvicorn src.main:app --reload`
- Exclude `.venv` from volume mount to avoid conflicts
- Ensure FastAPI startup events (DB init, Redis connect) run on reload

#### Dependencies
- S0-P5-001

#### Assigned To
- Person 5 (DevOps)

#### Estimation
- 3 hours

---

### S0-P5-003: Frontend Docker Hot Reload

**As a** frontend developer  
**I want** changes to TypeScript/React code to automatically reload the Next.js dev server  
**So that** I can see UI changes instantly

#### Acceptance Criteria
- **Given** the frontend service is running via Docker Compose
- **When** I modify any file in `apps/frontend/src/`
- **Then** Next.js HMR updates the browser within 3 seconds
- **And** shared package changes in `packages/shared/` also trigger reload

#### Technical Notes
- Mount frontend source and shared package as volumes
- Use `npm run dev` (not `npm run build`)
- Handle `node_modules` correctly (mount as anonymous volume)
- Ensure Turbopack or webpack HMR works through Docker

#### Dependencies
- S0-P5-001

#### Assigned To
- Person 5 (DevOps)

#### Estimation
- 3 hours

---

### S0-P2-001: Database Schema & Migrations

**As a** backend developer  
**I want** all database tables defined in SQLAlchemy with Alembic migrations  
**So that** the schema is version-controlled and reproducible

#### Acceptance Criteria
- **Given** PostgreSQL is running
- **When** I run `poetry run alembic upgrade head`
- **Then** all tables are created: `users`, `vendors`, `products`, `product_variants`, `orders`, `order_items`, `cart_items`, `conversations`, `inventory_transactions`, `external_signals`
- **And** `pgvector` extension is active
- **And** appropriate indexes exist on foreign keys and search fields

#### Technical Notes
- SQLAlchemy 2.0 declarative models with type annotations
- All primary keys are UUID
- `created_at` / `updated_at` on every table
- JSONB for flexible attributes
- Vector columns for embeddings (1024-dim text, 768-dim image)
- Generate first migration with `alembic revision --autogenerate`

#### Dependencies
- S0-P5-001

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 8 hours

---

### S0-P2-002: Database Connection & Async Session

**As a** backend developer  
**I want** an async database session manager with dependency injection  
**So that** FastAPI endpoints can access the database cleanly

#### Acceptance Criteria
- **Given** the backend is running
- **When** any endpoint uses `Depends(get_db)`
- **Then** an async SQLAlchemy session is provided
- **And** the session is properly closed after the request
- **And** connection pooling is configured

#### Technical Notes
- Use `create_async_engine` with `asyncpg`
- Use `async_sessionmaker` with `expire_on_commit=False`
- Create `get_db()` dependency generator
- Test with a simple health endpoint that queries `SELECT 1`

#### Dependencies
- S0-P2-001

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 3 hours

---

### S0-P3-001: Next.js Project Setup

**As a** frontend developer  
**I want** the Next.js 14 project configured with Tailwind, shadcn/ui, and TypeScript strict mode  
**So that** I can start building UI components immediately

#### Acceptance Criteria
- **Given** the frontend directory
- **When** I run `npm install` and `npm run dev`
- **Then** the dev server starts on port 3000
- **And** Tailwind classes work
- **And** shadcn/ui components can be added via CLI
- **And** TypeScript strict mode is enabled
- **And** the shared package `@intent-commerce/shared` is importable

#### Technical Notes
- Initialize shadcn/ui with `npx shadcn-ui@latest init`
- Configure `tailwind.config.ts` with CSS variables for theming
- Set up path aliases (`@/*` for src, `@intent-commerce/shared` for shared)
- Ensure `transpilePackages` includes the shared workspace package

#### Dependencies
- None

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 4 hours

---

### S0-P3-002: Shared Package Build System

**As a** frontend developer  
**I want** the shared TypeScript package to compile and be importable by the frontend  
**So that** types and schemas are synchronized between frontend and backend

#### Acceptance Criteria
- **Given** the shared package has type definitions
- **When** I run `npm run build` in `packages/shared/`
- **Then** `dist/` is generated with `.js` and `.d.ts` files
- **And** the frontend can import `import { Product } from '@intent-commerce/shared'`
- **And** Zod schemas validate correctly at runtime

#### Technical Notes
- Use `tsc` for compilation
- Export all types from `src/index.ts`
- Zod schemas should mirror TypeScript types exactly
- Add `types` and `main` fields to `package.json`
- Consider using `tsc --watch` for dev mode

#### Dependencies
- None

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 2 hours

---

### S0-P1-001: Qdrant Collection Setup

**As an** AI/ML engineer  
**I want** Qdrant collections configured for product embeddings  
**So that** I can start indexing and searching products

#### Acceptance Criteria
- **Given** Qdrant is running
- **When** I create the `products` collection
- **Then** it supports 1024-dim dense vectors (text)
- **And** it supports 768-dim dense vectors (image)
- **And** it has payload indexes on `vendor_id`, `category`, `status`, `price`
- **And** I can upsert a test point and retrieve it

#### Technical Notes
- Use `AsyncQdrantClient` from `qdrant-client`
- Collection config:
  - Text vectors: `size=1024`, `distance=Cosine`
  - Image vectors: `size=768`, `distance=Cosine`
- Payload schema: `{vendor_id: str, category: str, price: float, status: str, tags: list[str]}`
- Write a seed script that creates the collection and inserts 5 test products

#### Dependencies
- S0-P5-001

#### Assigned To
- Person 1 (AI/ML Lead)

#### Estimation
- 4 hours

---

### S0-P1-002: Embedding Model Evaluation

**As an** AI/ML engineer  
**I want** to validate that BGE-M3 and SigLIP load correctly and produce embeddings  
**So that** I know the ML dependencies are installed and working

#### Acceptance Criteria
- **Given** the backend virtualenv is activated
- **When** I run a test script
- **Then** BGE-M3 loads and encodes "red running shoes" into a 1024-dim vector
- **And** SigLIP loads and encodes a test image into a 768-dim vector
- **And** both models run on CPU (for local dev; GPU optional)

#### Technical Notes
- Use `sentence-transformers` for BGE-M3: `SentenceTransformer('BAAI/bge-m3')`
- Use `transformers` + `PIL` for SigLIP
- Write a standalone script in `scripts/test_embeddings.py`
- Verify vector dimensions match Qdrant collection config
- Document VRAM/RAM requirements in README

#### Dependencies
- S0-P5-002 (backend Docker with Poetry installed)

#### Assigned To
- Person 1 (AI/ML Lead)

#### Estimation
- 3 hours

---

### S0-P4-001: Forecasting Pipeline Skeleton

**As an** AI/Analytics engineer  
**I want** the forecasting module structure with stubs for Prophet, LightGBM, and NeuralForecast  
**So that** I can start implementing models in the next sprint

#### Acceptance Criteria
- **Given** the backend codebase
- **When** I import `src.forecasting.engine`
- **Then** `ForecastingEngine` class exists with methods: `fetch_sales_history`, `fetch_external_signals`, `train`, `predict`, `detect_anomalies`
- **And** all methods have proper type hints and docstrings
- **And** dependencies (pandas, numpy, prophet, lightgbm, neuralforecast) are in `pyproject.toml`

#### Technical Notes
- Install heavy ML libs: `prophet`, `lightgbm`, `neuralforecast`
- Design the `predict()` return format:
  ```python
  {
      "dates": ["2024-06-01", ...],
      "predicted_demand": [12, ...],
      "confidence": {"lower": [...], "upper": [...]},
      "stockout_date": "2024-06-15",
      "recommended_restock": 200
  }
  ```
- Create `src/forecasting/features.py` for feature engineering stubs

#### Dependencies
- S0-P5-002

#### Assigned To
- Person 4 (AI/Analytics Engineer)

#### Estimation
- 4 hours

---

### S0-P4-002: Analytics API Skeleton

**As an** AI/Analytics engineer  
**I want** analytics endpoints stubbed with Pydantic request/response models  
**So that** the frontend knows the API contract for dashboard features

#### Acceptance Criteria
- **Given** the backend is running
- **When** I hit `POST /api/v1/analytics/query`
- **Then** I get a 501 response with a clear message (not implemented yet)
- **And** the request/response schemas are defined in Pydantic
- **And** `GET /api/v1/analytics/dashboard` returns an empty metrics array

#### Technical Notes
- Define `AnalyticsQuery` and `AnalyticsResponse` Pydantic models
- Response should support both table data and chart specs:
  ```python
  class AnalyticsResponse(BaseModel):
      query: str
      data: list[dict]
      chart_spec: dict | None  # Vega-Lite or Recharts config
      summary: str | None  # Natural language summary
  ```

#### Dependencies
- S0-P2-002

#### Assigned To
- Person 4 (AI/Analytics Engineer)

#### Estimation
- 2 hours

---

### S0-P5-004: Celery Worker Setup

**As a** developer  
**I want** a Celery worker connected to Redis that can process background jobs  
**So that** long-running tasks (embeddings, forecasts) don't block API requests

#### Acceptance Criteria
- **Given** Redis is running
- **When** I start the worker with `celery -A src.worker.main worker --loglevel=info`
- **Then** the worker connects to Redis and waits for tasks
- **And** I can enqueue a test task from the FastAPI shell
- **And** the task executes and returns a result

#### Technical Notes
- Use `celery[redis]` as broker and backend
- Create `src/worker/main.py` with Celery app configuration
- Create `src/worker/tasks.py` with a dummy `add` task for testing
- Ensure Docker Compose includes a `worker` service
- Document how to monitor workers (Flower optional)

#### Dependencies
- S0-P5-001

#### Assigned To
- Person 5 (DevOps)

#### Estimation
- 3 hours

---

### S0-P5-005: Environment Configuration & Documentation

**As a** new developer joining the project  
**I want** clear documentation and working `.env` templates  
**So that** I can set up the project in under 10 minutes

#### Acceptance Criteria
- **Given** a fresh clone
- **When** I follow the README quick start
- **Then** all commands succeed without errors
- **And** the `.env.example` files have comments explaining each variable
- **And** `make setup` creates all required env files
- **And** `make up` starts infrastructure
- **And** `make install` installs all dependencies

#### Technical Notes
- Create `.env.example` at root with all shared variables
- Create `apps/backend/.env.example` with backend-specific vars
- Create `apps/frontend/.env.local.example` with frontend vars
- Update `README.md` with exact step-by-step commands
- Test the entire flow on a clean environment

#### Dependencies
- All S0 stories

#### Assigned To
- Person 5 (DevOps)

#### Estimation
- 2 hours

---

## Sprint 0 Definition of Done

- [ ] `docker-compose up -d postgres redis qdrant` works for all team members
- [ ] `make install` installs frontend and backend dependencies
- [ ] `poetry run alembic upgrade head` creates all tables
- [ ] `npm run dev` starts frontend with hot reload
- [ ] `poetry run uvicorn src.main:app --reload` starts backend with hot reload
- [ ] Qdrant collection `products` is created with correct vector configs
- [ ] Embedding models (BGE-M3, SigLIP) load and produce vectors
- [ ] Celery worker connects to Redis and processes test tasks
- [ ] README quick start is tested end-to-end
- [ ] Team standup confirms everyone can run the stack

## Sprint 0 Demo

Show the working local environment:
1. `make up` → services running
2. `docker-compose ps` → all healthy
3. Backend health endpoint returns `{"status": "ok"}`
4. Frontend loads at `http://localhost:3000`
5. Qdrant dashboard accessible
6. Test embedding script runs successfully
7. Celery worker processes a test task
