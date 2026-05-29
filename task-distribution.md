# Task Distribution & Sprint Planning

## Team Members & Module Ownership

### 1. AI/ML Lead (Person 1)
**Primary Focus:** Conversational AI, RAG Pipeline, Agent Architecture

**Directories Owned:**
- `apps/backend/src/agents/` — LangGraph shopping agent, state management, tool definitions
- `apps/backend/src/embeddings/` — BGE-M3 text embeddings, SigLIP image embeddings, Qdrant indexing
- `apps/backend/src/api/v1/endpoints/chat.py` — Chat/WebSocket endpoint integration

**Sprint 1 Tasks:**
1. Set up Qdrant vector collections with proper schemas
2. Implement multimodal embedding pipeline (text + image)
3. Build hybrid retrieval (dense + sparse + RRF)
4. Define LangGraph agent state graph and tool specifications
5. Implement inventory check and product retrieval tools

**Sprint 2 Tasks:**
1. Connect chat endpoint to agent
2. Implement conversation memory and context persistence
3. Add product recommendation explanation generation
4. Handle edge cases: stockouts, no results, ambiguous queries

**Dependencies On:**
- Backend Lead (database schema, API structure)
- DevOps (Qdrant container, image storage)

**Provides To:**
- Frontend Lead (streaming chat API contract)
- AI/Analytics Engineer (conversation data for forecasting)

---

### 2. Backend Lead (Person 2)
**Primary Focus:** API Design, Database, Payments, Security, Cart/Orders

**Directories Owned:**
- `apps/backend/src/models/` — SQLAlchemy models
- `apps/backend/src/api/` — FastAPI routers, dependency injection, middleware
- `apps/backend/src/services/` — Business logic for products, orders, cart, auth
- `apps/backend/src/core/` — Security, JWT, config, database connection
- `apps/backend/alembic/` — Database migrations

**Sprint 1 Tasks:**
1. Finalize and implement database schema (all tables)
2. Set up SQLAlchemy 2.0 with asyncpg
3. Implement authentication (JWT for users and vendors)
4. Build CRUD APIs: products, vendors, users
5. Implement cart service (database-backed, not just agent memory)
6. Set up Alembic migration system

**Sprint 2 Tasks:**
1. Order creation and lifecycle management
2. Stripe payment integration (checkout session + webhooks)
3. Address and payment method management endpoints
4. Inventory transaction tracking
5. Role-based access control (RBAC) middleware

**Dependencies On:**
- DevOps (PostgreSQL setup, Redis)

**Provides To:**
- AI/ML Lead (database models for agent tools)
- Frontend Lead (REST API contract)
- AI/Analytics Engineer (order/sales data for forecasting)

---

### 3. Frontend Lead (Person 3)
**Primary Focus:** User Interface, Chat UX, Vendor Dashboard, Cart/Checkout

**Directories Owned:**
- `apps/frontend/src/app/` — Next.js App Router pages
- `apps/frontend/src/components/` — React components (chat, catalog, cart, checkout)
- `apps/frontend/src/hooks/` — Custom React hooks
- `apps/frontend/src/lib/` — API clients, utilities
- `packages/shared/` — Shared TypeScript types

**Sprint 1 Tasks:**
1. Set up Next.js 14 project with Tailwind, shadcn/ui
2. Configure shared package and Zod schemas
3. Build layout: navigation, authentication pages
4. Implement streaming chat interface (Vercel AI SDK)
5. Create product catalog/card components
6. Build vendor product upload form (with image preview)

**Sprint 2 Tasks:**
1. Shopping cart UI (sync with backend cart API)
2. Checkout flow pages (address, payment, confirmation)
3. Vendor dashboard shell and routing
4. User order history page
5. Responsive design and mobile optimization

**Dependencies On:**
- Backend Lead (API contract, endpoints)
- AI/ML Lead (chat API streaming format)

**Provides To:**
- AI/Analytics Engineer (dashboard shell for analytics widgets)

---

### 4. AI/Analytics Engineer (Person 4)
**Primary Focus:** Demand Forecasting, NL Analytics, Dynamic Charts, External Data

**Directories Owned:**
- `apps/backend/src/forecasting/` — Demand forecasting engine
- `apps/backend/src/api/v1/endpoints/analytics.py` — Analytics and forecasting endpoints
- `apps/frontend/src/components/analytics/` — Chart components, dashboard widgets

**Sprint 1 Tasks:**
1. Set up forecasting pipeline structure (Prophet, LightGBM stubs)
2. Implement historical sales data aggregation queries
3. Build external signal ingestion (festivals, holidays, weather stubs)
4. Create NL-to-SQL agent for vendor dashboard prompts
5. Define chart generation API (JSON spec → rendered chart)

**Sprint 2 Tasks:**
1. Train/test forecasting models on historical data
2. Implement "insight generation" (anomaly detection, recommendations)
3. Build dynamic chart renderer in frontend (Recharts)
4. Add forecasting to vendor dashboard ("Will I stock out?")
5. Cache frequent analytics queries in Redis

**Dependencies On:**
- Backend Lead (database schema, sales data availability)
- Frontend Lead (dashboard component structure)

**Provides To:**
- Vendor Dashboard (forecasting widgets, NL analytics)

---

### 5. DevOps / Full-Stack Support (Person 5)
**Primary Focus:** Infrastructure, CI/CD, Image Storage, Async Jobs, Testing

**Directories Owned:**
- `docker-compose.yml`
- `docker/` and `infra/` — All Docker and infrastructure configs
- `apps/backend/src/worker/` — Celery / background job workers
- Repository root config files

**Sprint 1 Tasks:**
1. Finalize Docker Compose stack (postgres, redis, qdrant, backend, frontend)
2. Set up PostgreSQL with pgvector initialization
3. Configure image upload pipeline (local dev → S3/R2 in prod)
4. Implement async job workers (Celery with Redis)
  - Background embedding generation on product upload
  - Inventory alerts
5. Set up hot-reload dev environment for all services

**Sprint 2 Tasks:**
1. Build CI/CD pipeline (GitHub Actions: lint, test, build)
2. Set up staging environment configuration
3. Implement health checks and monitoring stubs
4. Optimize Docker images for production
5. Database backup strategy and seed data scripts

**Dependencies On:**
- Everyone (understanding resource needs)

**Provides To:**
- Everyone (working local dev environment, deployment)

---

## API Contracts & Interfaces

### Between Frontend and Backend

**Authentication:**
- POST `/api/v1/auth/register` — Create user or vendor account
- POST `/api/v1/auth/login` — JWT token
- GET `/api/v1/auth/me` — Current user profile

**Products:**
- GET `/api/v1/products` — List/search with filters
- GET `/api/v1/products/{id}` — Product detail
- POST `/api/v1/products` — Vendor upload (multipart with images)
- PUT `/api/v1/products/{id}` — Update

**Chat:**
- POST `/api/v1/chat` — Send message, get streaming response
- GET `/api/v1/chat/history` — Conversation history
- WebSocket `/ws/chat` — Real-time chat (preferred)

**Cart:**
- GET `/api/v1/cart` — Current cart
- POST `/api/v1/cart/items` — Add item
- DELETE `/api/v1/cart/items/{id}` — Remove item

**Orders:**
- POST `/api/v1/orders` — Create order (initiate checkout)
- POST `/api/v1/orders/{id}/confirm` — Confirm payment
- GET `/api/v1/orders` — Order history

**Analytics (Vendor Only):**
- POST `/api/v1/analytics/query` — Natural language query
- GET `/api/v1/analytics/forecast/{product_id}` — Demand forecast
- GET `/api/v1/analytics/dashboard` — Pre-computed metrics

### Between Backend Modules

**Agent ↔ Services:**
- Agent tools call service layer functions directly (Python imports)
- Services must NOT import agent layer (unidirectional dependency)

**Embedding Pipeline ↔ Product Upload:**
- Product upload API enqueues embedding generation job
- Worker processes job and upserts to Qdrant

**Forecasting ↔ Analytics:**
- Forecasting engine reads from order_items, inventory_transactions
- Analytics endpoint calls forecasting engine for predictions

---

## Sprint Schedule

### Sprint 0: Foundation (Week 1)
- DevOps: Docker Compose, hot reload, shared package
- Backend Lead: Database schema, migrations, base API
- Frontend Lead: Next.js setup, shadcn/ui theme, layout shell
- AI/ML Lead: Qdrant setup, embedding model evaluation
- AI/Analytics: Data model understanding, forecasting research

### Sprint 1: Core Commerce (Weeks 2-4)
- Backend: Auth, CRUD, cart database, Stripe setup
- Frontend: Auth pages, product upload (vendor), catalog browsing
- AI/ML: Product retrieval working via API, basic chat interface
- AI/Analytics: NL-to-SQL prototype, external signal ingestion stubs
- DevOps: Image upload, Celery workers, pgvector confirmed working

### Sprint 2: Conversational AI (Weeks 5-7)
- AI/ML: Full agent with tools, inventory check, context memory
- Frontend: Streaming chat, product cards in chat, add-to-cart from chat
- Backend: Order lifecycle, payment webhooks, inventory transactions
- AI/Analytics: Forecasting models trained, vendor dashboard charts
- DevOps: Background embedding jobs, CI/CD basic pipeline

### Sprint 3: Intelligence & Polish (Weeks 8-10)
- AI/ML: Multimodal search (image upload in chat), preference learning
- Frontend: Vendor AI dashboard, analytics widgets, order management
- Backend: Advanced RBAC, rate limiting, search optimization
- AI/Analytics: Demand forecasting live, anomaly detection, insights
- DevOps: Production Docker optimization, staging deployment, monitoring

---

## Communication Rules

1. **Never break the build.** Run `make test` before pushing.
2. **API changes require updating `packages/shared/src/schemas.ts`.**
3. **Database changes require Alembic migrations committed to `apps/backend/alembic/versions/`.**
4. **Agent tool changes must be documented in `apps/backend/src/agents/tools.py` docstrings.**
5. **Frontend components must use shared types from `@intent-commerce/shared`.**
6. **Daily standup:** What did you complete? What do you need from others? Blockers?

## Code Review Checklist

- [ ] TypeScript types match shared schemas
- [ ] Python functions have type hints
- [ ] New database tables have Alembic migrations
- [ ] API endpoints have Pydantic response models
- [ ] Frontend components are responsive
- [ ] Sensitive keys are in `.env`, never committed
- [ ] Docker services start with `make up`
