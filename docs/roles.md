# Team Roles & Responsibilities

## Person 1: AI/ML Lead

**Primary Expertise:** Natural Language Processing, Information Retrieval, Agent Architecture
**Secondary:** Vector Databases, Prompt Engineering, LLM Tool Use

### Owned Directories
- `apps/backend/src/agents/`
- `apps/backend/src/embeddings/`
- `apps/backend/src/api/v1/endpoints/chat.py`

### Core Responsibilities
1. **Multimodal RAG Pipeline**
   - Text embeddings via BGE-M3 (dense + sparse)
   - Image embeddings via SigLIP
   - Hybrid retrieval (dense + sparse + RRF)
   - Qdrant collection design and indexing

2. **Conversational Agent**
   - LangGraph state machine design
   - Tool definitions and bindings
   - Context memory and conversation persistence
   - Prompt engineering for shopping scenarios

3. **Product Understanding**
   - Embedding generation on product upload
   - Query understanding and intent classification
   - Result ranking and explanation generation

### Interface Points
- **Receives from P2 (Backend):** Database schema for products, inventory, conversations
- **Provides to P3 (Frontend):** Streaming chat API contract, product recommendation format
- **Collaborates with P5 (DevOps):** Qdrant setup, embedding worker queue

### Success Metrics
- Retrieval accuracy (relevant products in top-5)
- Chat session completion rate (user finds product)
- Latency: <2s for retrieval + response generation

---

## Person 2: Backend Lead

**Primary Expertise:** API Design, Database Architecture, Payment Systems
**Secondary:** Security, Async Python, SQLAlchemy

### Owned Directories
- `apps/backend/src/models/`
- `apps/backend/src/api/`
- `apps/backend/src/services/`
- `apps/backend/src/core/`
- `apps/backend/alembic/`

### Core Responsibilities
1. **Database & Migrations**
   - Complete SQLAlchemy 2.0 model definitions
   - Alembic migration generation and management
   - Index optimization and query performance

2. **Authentication & Authorization**
   - JWT-based auth for users and vendors
   - Role-based access control (RBAC)
   - Password hashing and session management

3. **Commerce Engine**
   - Cart service (database-backed, not agent memory)
   - Order lifecycle (pending → paid → shipped → delivered)
   - Stripe integration (checkout sessions, webhooks, refunds)
   - Inventory tracking and transaction logging

4. **API Layer**
   - RESTful endpoint design with Pydantic v2 models
   - Input validation and error handling
   - Rate limiting and API documentation

### Interface Points
- **Receives from P5 (DevOps):** Database, Redis, infrastructure health
- **Provides to P1 (AI/ML):** Service layer functions for agent tools
- **Provides to P3 (Frontend):** REST API contract, OpenAPI spec
- **Provides to P4 (Analytics):** Sales data, order history, inventory movements

### Success Metrics
- API response time p95 < 200ms for CRUD
- Zero data integrity issues (cart/order mismatch)
- Payment success rate > 99%

---

## Person 3: Frontend Lead

**Primary Expertise:** React/Next.js, TypeScript, UI/UX Design
**Secondary:** State Management, Streaming UIs, Responsive Design

### Owned Directories
- `apps/frontend/src/app/`
- `apps/frontend/src/components/`
- `apps/frontend/src/hooks/`
- `apps/frontend/src/lib/`
- `packages/shared/`

### Core Responsibilities
1. **User-Facing Application**
   - Landing page, authentication pages
   - Product catalog browsing with filters
   - Product detail pages with image gallery
   - Shopping cart UI
   - Checkout flow (address, payment, confirmation)
   - Order history and tracking

2. **Conversational Shopping Interface**
   - Real-time streaming chat UI (Vercel AI SDK)
   - Product cards embedded in chat messages
   - "Add to cart" buttons within chat
   - Chat history sidebar

3. **Vendor Dashboard**
   - Product upload form with image drag-and-drop
   - Product management (edit, archive, delete)
   - Order management for vendor's products
   - Analytics dashboard shell and widgets

4. **Shared Package**
   - TypeScript type definitions
   - Zod runtime validation schemas
   - Frontend-backend contract enforcement

### Interface Points
- **Receives from P2 (Backend):** API endpoints, data models
- **Receives from P1 (AI/ML):** Streaming chat response format
- **Receives from P4 (Analytics):** Chart data structures, NL query results
- **Provides to P5 (DevOps):** Build config, environment variables

### Success Metrics
- Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- Time to Interactive < 3s on 4G
- Mobile viewport usability (no horizontal scroll, touch targets > 44px)

---

## Person 4: AI/Analytics Engineer

**Primary Expertise:** Time Series Forecasting, Natural Language to SQL, Data Visualization
**Secondary:** Machine Learning, Feature Engineering, Statistical Analysis

### Owned Directories
- `apps/backend/src/forecasting/`
- `apps/backend/src/api/v1/endpoints/analytics.py`
- `apps/frontend/src/components/analytics/` (charts and widgets)

### Core Responsibilities
1. **Demand Forecasting Engine**
   - Historical sales data aggregation and feature engineering
   - External signal ingestion (festivals, weather, trends, holidays)
   - Model ensemble: Prophet + LightGBM + NeuralForecast
   - Stockout prediction and restock recommendations
   - Model retraining pipeline

2. **Natural Language Analytics**
   - NL-to-SQL conversion for vendor dashboard queries
   - Dynamic chart generation (JSON spec → rendered chart)
   - Pre-computed dashboard metrics (top products, revenue, conversion)
   - Anomaly detection and alerting

3. **Data Intelligence**
   - Insight generation ("Sales dropped 20% this week vs last")
   - Trend identification from search and sales data
   - Product recommendation for vendors ("Customers who bought X also bought Y")

### Interface Points
- **Receives from P2 (Backend):** Database access to orders, inventory, products
- **Receives from P1 (AI/ML):** Conversation data for trend analysis
- **Provides to P3 (Frontend):** Chart data structures, forecast JSON
- **Collaborates with P5 (DevOps):** Background forecast jobs, data pipelines

### Success Metrics
- Forecast MAPE (Mean Absolute Percentage Error) < 20% for products with >30 days history
- NL query accuracy > 85% (correct SQL generation)
- Dashboard load time < 2s

---

## Person 5: DevOps / Full-Stack Support

**Primary Expertise:** Infrastructure, CI/CD, Docker, Background Job Systems
**Secondary:** Cloud Services, Image Processing, Full-Stack Debugging

### Owned Directories
- `docker-compose.yml`
- `apps/backend/Dockerfile`
- `apps/frontend/Dockerfile`
- `infra/`
- `apps/backend/src/worker/`
- Root-level config files

### Core Responsibilities
1. **Local Development Environment**
   - Docker Compose orchestration (postgres, redis, qdrant, backend, frontend, worker)
   - Hot-reload configuration for all services
   - Environment variable management and documentation
   - Database initialization scripts

2. **Background Job System**
   - Celery worker setup with Redis broker
   - Embedding generation jobs (triggered on product upload)
   - Inventory alert jobs (low stock notifications)
   - Forecast retraining jobs (scheduled)

3. **Image & Asset Pipeline**
   - Image upload handling (multipart/form-data)
   - S3/R2 integration for production image storage
   - Image validation (format, size, dimensions)
   - Thumbnail generation

4. **CI/CD & Deployment**
   - GitHub Actions: lint, test, build
   - Staging environment configuration
   - Production Docker optimization
   - Health checks and monitoring stubs
   - Database backup strategy

5. **Cross-Team Support**
   - Debug infrastructure issues
   - Assist with Docker-related problems
   - Performance profiling and optimization
   - Security hardening (HTTPS, CORS, headers)

### Interface Points
- **Provides to Everyone:** Working dev environment, deployment pipeline
- **Collaborates with P1 (AI/ML):** Qdrant setup, embedding worker queue
- **Collaborates with P2 (Backend):** Database connection pooling, Redis sessions
- **Collaborates with P3 (Frontend):** Image CDN, build optimization

### Success Metrics
- `docker-compose up` starts all services in < 60s
- CI/CD pipeline runs in < 10 minutes
- Zero secrets committed to repository
- Uptime monitoring in place

---

## Collaboration Rules

### Code Review
- **P1 reviews P2's agent tool interfaces** (to ensure services are callable by agents)
- **P2 reviews P1's database queries** (to ensure no N+1 or injection risks)
- **P3 reviews P4's chart data structures** (to ensure frontend can render them)
- **P5 reviews all Docker/infrastructure changes**
- **Everyone reviews shared package changes**

### Daily Standup Format
1. What stories did you complete yesterday? (Use story IDs)
2. What stories are you working on today?
3. What blockers do you have? Who do you need help from?
4. Are any specs unclear or need updating?

### Spec Changes
If a story needs to change during development:
1. Update the spec document FIRST
2. Notify the team in standup
3. Update dependencies in downstream stories
4. Never change acceptance criteria after work has started without team agreement
