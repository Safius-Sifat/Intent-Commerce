# Specification: Infrastructure & DevOps

## Overview

This document defines the infrastructure, deployment, and operational requirements for Intent Commerce. It covers local development environment, production deployment, CI/CD, monitoring, and security hardening.

## Local Development Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Host                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL │  │    Redis    │  │      Qdrant         │  │
│  │  (pgvector) │  │  (Broker)   │  │  (Vector DB)        │  │
│  │  Port: 5432 │  │  Port: 6379 │  │  Port: 6333         │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                    │              │
│  ┌──────┴────────────────┴────────────────────┴──────────┐  │
│  │                    FastAPI Backend                       │  │
│  │  Port: 8000  (Hot Reload: --reload)                      │  │
│  │  - API Layer                                             │  │
│  │  - Agent Runtime                                           │  │
│  │  - Embedding Pipeline                                      │  │
│  └──────┬──────────────────────────────────────────────────┘  │
│         │                                                      │
│  ┌──────┴──────────────────────────────────────────────────┐  │
│  │                  Next.js Frontend                          │  │
│  │  Port: 3000  (Hot Reload: HMR)                           │  │
│  │  - User Interface                                          │  │
│  │  - Vendor Dashboard                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│         │                                                      │
│  ┌──────┴──────────────────────────────────────────────────┐  │
│  │                  Celery Worker                           │  │
│  │  - Background Embedding Generation                       │  │
│  │  - Forecast Retraining                                   │  │
│  │  - Inventory Alerts                                        │  │
│  │  - Order Expiry Checks                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Docker Compose Configuration

### Services

| Service | Image | Ports | Volumes | Healthcheck |
|---------|-------|-------|---------|-------------|
| postgres | `ankane/pgvector:latest` | 5432 | `postgres-data`, `init.sql` | `pg_isready` |
| redis | `redis:7-alpine` | 6379 | `redis-data` | `redis-cli ping` |
| qdrant | `qdrant/qdrant:latest` | 6333, 6334 | `qdrant-storage` | `curl /healthz` |
| backend | Custom (Python 3.11) | 8000 | Source code mount | HTTP `/health` |
| frontend | Custom (Node 20) | 3000 | Source code mount | HTTP `/` |
| worker | Custom (Python 3.11) | — | Source code mount | Celery ping |

### Environment Variables

```bash
# Database
POSTGRES_USER=intent
POSTGRES_PASSWORD=intent_dev_password
POSTGRES_DB=intent_commerce
DATABASE_URL=postgresql+asyncpg://intent:intent_dev_password@postgres:5432/intent_commerce

# Redis
REDIS_URL=redis://redis:6379/0

# Qdrant
QDRANT_URL=http://qdrant:6333

# LLM
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App
ENVIRONMENT=development
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# S3 (Production)
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=intent-commerce-images
```

## Production Architecture

```
┌─────────────────┐
│   CDN / WAF     │  (Cloudflare / AWS CloudFront)
└────────┬────────┘
         │
┌────────┴────────┐
│   Load Balancer │  (Nginx / AWS ALB)
│   (SSL Term)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐ ┌─┴─────┐
│Frontend│ │Frontend│  (Next.js, multiple instances)
│ :3000  │ │ :3000  │
└───┬───┘ └─┬─────┘
    │       │
    └───────┘
         │
┌────────┴────────┐
│   API Gateway   │  (Nginx reverse proxy / Kong)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐ ┌─┴─────┐
│Backend│ │Backend│  (FastAPI, multiple instances)
│ :8000 │ │ :8000 │
└───┬───┘ └─┬─────┘
     │       │
     └───────┘
          │
    ┌─────┴─────┐
    │           │
┌───┴───┐   ┌─┴─────┐
│PostgreSQL│ │ Redis   │
│(Primary)│ │(Cluster)│
└─────────┘   └───────┘
    │
┌───┴───┐
│Qdrant │
│(Cluster)│
└───────┘
    │
┌───┴───┐
│Worker │  (Celery, multiple workers)
│Nodes  │
└───────┘
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install Poetry
        uses: snok/install-poetry@v1
      - name: Install dependencies
        run: cd apps/backend && poetry install
      - name: Run Ruff
        run: cd apps/backend && poetry run ruff check src/
      - name: Run mypy
        run: cd apps/backend && poetry run mypy src/

  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: ankane/pgvector:latest
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install Poetry
        uses: snok/install-poetry@v1
      - name: Install dependencies
        run: cd apps/backend && poetry install
      - name: Run tests
        run: cd apps/backend && poetry run pytest -v
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379/0

  frontend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/frontend/package-lock.json
      - name: Install dependencies
        run: cd apps/frontend && npm ci
      - name: Run ESLint
        run: cd apps/frontend && npm run lint
      - name: Type check
        run: cd apps/frontend && npm run typecheck

  build-and-deploy:
    needs: [backend-lint, backend-test, frontend-lint]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: docker-compose build
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker-compose push
      - name: Deploy to staging
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_KEY }}
          script: |
            cd /opt/intent-commerce
            docker-compose pull
            docker-compose up -d
```

## Monitoring & Observability

### Health Checks

```python
# FastAPI health endpoint
@app.get("/health")
async def health_check():
    checks = {
        "postgres": await check_postgres(),
        "redis": await check_redis(),
        "qdrant": await check_qdrant(),
    }
    
    healthy = all(checks.values())
    status_code = 200 if healthy else 503
    
    return JSONResponse(
        content={"status": "healthy" if healthy else "unhealthy", "checks": checks},
        status_code=status_code
    )
```

### Structured Logging

```python
import structlog
import logging

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage
logger.info("order_created", order_id="uuid", user_id="uuid", total=285.98)
# Output: {"event": "order_created", "order_id": "uuid", "user_id": "uuid", "total": 285.98, "timestamp": "2024-06-01T10:00:00Z", "level": "info"}
```

### Key Metrics to Track

| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| API response time (p95) | Gauge | > 500ms |
| API error rate | Rate | > 1% |
| Database connection pool usage | Gauge | > 80% |
| Redis memory usage | Gauge | > 80% |
| Qdrant search latency | Gauge | > 200ms |
| LLM API response time | Gauge | > 5s |
| Cart abandonment rate | Rate | > 70% |
| Payment success rate | Rate | < 95% |
| Celery task failure rate | Rate | > 5% |
| Embedding generation queue depth | Gauge | > 100 |

## Security Hardening

### Application Security

```python
# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/auth/login")
@limiter.limit("10/minute")
async def login(request: Request):
    ...

@app.post("/api/v1/chat")
@limiter.limit("30/minute")
async def chat(request: Request):
    ...
```

### Security Headers (Nginx)

```nginx
server {
    # ...
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;" always;
}
```

### Secret Management

| Environment | Method |
|-------------|--------|
| Local dev | `.env` files (gitignored) |
| Staging | GitHub Secrets + Docker env |
| Production | AWS Secrets Manager / HashiCorp Vault |

**Rules:**
- Never commit `.env` files
- Rotate API keys quarterly
- Use separate Stripe keys for test/prod
- Use least-privilege IAM roles for S3

## Backup Strategy

### PostgreSQL

```bash
# Automated daily backups
pg_dump -h localhost -U intent -d intent_commerce > backup_$(date +%Y%m%d).sql

# Retention: 7 daily, 4 weekly, 12 monthly
```

### Qdrant

```bash
# Qdrant supports snapshots
# Create snapshot via API
curl -X POST http://localhost:6333/collections/products/snapshots

# Restore from snapshot
curl -X PUT http://localhost:6333/collections/products/snapshots/recover \
  -H "Content-Type: application/json" \
  -d '{"location": "/qdrant/snapshots/products.snapshot"}'
```

## Implementation Checklist

- [ ] Docker Compose for local development (all 6 services)
- [ ] Backend Dockerfile with hot reload
- [ ] Frontend Dockerfile with hot reload
- [ ] Celery worker Dockerfile
- [ ] PostgreSQL init script (pgvector, uuid-ossp)
- [ ] Nginx reverse proxy config
- [ ] GitHub Actions CI/CD workflow
- [ ] Backend lint (Ruff) and type check (mypy)
- [ ] Backend test suite (pytest)
- [ ] Frontend lint (ESLint) and type check (TypeScript)
- [ ] Docker image build and push to registry
- [ ] Staging deployment automation
- [ ] Health check endpoint
- [ ] Structured JSON logging
- [ ] Rate limiting middleware
- [ ] Security headers (HSTS, CSP, X-Frame-Options)
- [ ] CORS configuration
- [ ] Secret management strategy
- [ ] Database backup script
- [ ] Qdrant snapshot configuration
- [ ] Monitoring metrics definition
- [ ] SSL/TLS certificate setup (Let's Encrypt)
- [ ] Load balancer configuration
- [ ] Auto-scaling rules (optional, post-MVP)

## Testing Scenarios

1. `docker-compose up` starts all services within 60 seconds
2. Hot reload: change backend code → server restarts within 2s
3. Hot reload: change frontend code → browser updates within 3s
4. Health check: all services healthy → 200, one down → 503
5. Rate limiting: 11th login attempt in 1 minute → 429
6. CORS: request from unauthorized origin → blocked
7. Secret safety: `grep -r "sk_live" .` in repo → no results
8. CI pipeline: push to main → lint + test + build + deploy
9. Backup: run backup script → file created, can restore
10. SSL: visit production URL → valid HTTPS certificate
