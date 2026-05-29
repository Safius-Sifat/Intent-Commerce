# Architecture: Data Flow Diagrams

## Overview

This document illustrates how data flows through the Intent Commerce system for the most critical user journeys.

---

## 1. Product Upload Flow (Vendor)

```
Vendor Dashboard
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  PostgreSQL │
│  Upload     │     │  Validate   │     │  Save Product│
│  Form       │     │  Images     │     │  & Variants │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Storage   │
                    │  (Local/S3) │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Celery    │
                    │   Worker    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ BGE-M3  │  │ SigLIP  │  │ Qdrant  │
        │ (Text)  │  │ (Image) │  │ Upsert  │
        └─────────┘  └─────────┘  └─────────┘
```

**Steps:**
1. Vendor fills product form and uploads images
2. Frontend sends multipart POST to `/api/v1/products`
3. Backend validates images (format, size, dimensions)
4. Backend saves product and variants to PostgreSQL
5. Backend saves images to storage (local dev / S3 prod)
6. Backend enqueues Celery task `generate_product_embeddings`
7. Worker generates text embedding (BGE-M3) and image embedding (SigLIP)
8. Worker upserts vectors to Qdrant
9. Worker updates product record with embedding status

---

## 2. Conversational Shopping Flow (User)

```
User Chat Interface
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Vercel AI  │────▶│   Backend   │────▶│  PostgreSQL │
│  SDK Stream │     │   Chat API  │     │  Load Chat  │
└─────────────┘     └──────┬──────┘     │  History    │
                           │             └─────────────┘
                           ▼
                    ┌─────────────┐
                    │  LangGraph  │
                    │   Agent     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ Intent  │  │  RAG    │  │  Cart   │
        │Classify │  │ Search  │  │ Service │
        └─────────┘  └────┬────┘  └─────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Qdrant    │
                   │  (Hybrid    │
                   │   Search)   │
                   └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  PostgreSQL │
                   │ (Inventory  │
                   │   Check)    │
                   └─────────────┘
```

**Steps:**
1. User types message in chat (or uploads image)
2. Frontend streams message to backend via SSE
3. Backend loads conversation history from PostgreSQL
4. Backend initializes agent state with history and user preferences
5. Agent classifies intent (search, cart, checkout, etc.)
6. If search: agent calls RAG pipeline
   - Text query → BGE-M3 embedding → Qdrant dense search
   - Optional: image → SigLIP → Qdrant image search
   - Merge with BM25 keyword search via RRF
7. Agent checks inventory for each retrieved product
8. Agent decides action (show products, add to cart, ask question)
9. Agent formats natural language response
10. Backend streams response chunks to frontend
11. Frontend renders text + product cards inline
12. Full conversation saved to PostgreSQL

---

## 3. Checkout & Payment Flow

```
User Chat / UI
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Checkout   │────▶│   Backend   │────▶│  PostgreSQL │
│  Request    │     │  Order API  │     │  Create     │
│  (Confirm)  │     │             │     │  Order      │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Inventory  │
                    │   Hold      │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Stripe   │
                    │  PaymentIntent│
                    └──────┬──────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Stripe.js  │◀────│  Frontend   │     │  PostgreSQL │
│  (Confirm   │     │  (Payment   │────▶│  Confirm    │
│   Card)     │     │   Form)     │     │  Order      │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│  Stripe     │
│  Webhook    │
│  (Backup    │
│   Confirm)  │
└─────────────┘
```

**Steps:**
1. User confirms checkout in chat or UI
2. Backend validates cart and user address/payment method
3. Backend creates order with status "pending"
4. Backend holds inventory (deducts from product/variant counts)
5. Backend logs inventory transactions (type: "hold")
6. Backend creates Stripe PaymentIntent, gets `client_secret`
7. Backend returns order draft + `client_secret` to frontend
8. Frontend presents Stripe payment form
9. User enters payment details, Stripe confirms client-side
10. Frontend calls `POST /api/v1/orders/{id}/confirm`
11. Backend verifies payment with Stripe API
12. If successful:
    - Order status → "paid"
    - Inventory hold → permanent sale (log transactions)
    - Clear user's cart
    - Return confirmation
13. If failed:
    - Order status → "cancelled"
    - Release held inventory (log transactions)
    - Return error
14. Async: Stripe webhook handles edge cases (frontend didn't confirm)

---

## 4. Vendor Analytics Flow

```
Vendor Dashboard
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  NL Query   │────▶│   Backend   │────▶│     LLM     │
│  Input      │     │  Analytics  │     │  (Intent    │
│             │     │   API       │     │  + SQL Gen) │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   PostgreSQL│
                                        │  (Execute   │
                                        │   Query)    │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Backend   │
                                        │  (Chart     │
                                        │   Spec +    │
                                        │   Summary)  │
                                        └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Summary    │◀────│   Chart     │◀────│   Data      │
│  Text       │     │  (Recharts) │     │   Table     │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Steps:**
1. Vendor types natural language query in dashboard
2. Backend receives query with vendor context
3. LLM classifies intent and extracts entities
4. LLM generates SQL with schema context and few-shot examples
5. SQL validator ensures read-only + vendor-scoped
6. Backend executes SQL against PostgreSQL
7. Backend determines chart type from result shape
8. Backend generates chart specification (JSON)
9. LLM generates natural language summary of results
10. Backend returns: summary + chart_spec + data table
11. Frontend renders chart with Recharts
12. Frontend displays data table and summary text

---

## 5. Demand Forecasting Flow

```
Celery Scheduled Task (Weekly)
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Fetch      │────▶│   Feature   │────▶│  Train      │
│  Sales Data │     │ Engineering │     │  Models     │
│  (365 days) │     │  (Lags,     │     │  (Prophet,  │
│             │     │   Rolling,  │     │  LightGBM,  │
│             │     │   External) │     │  N-BEATS)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Ensemble   │
                                        │  Forecast   │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Cache in   │
                                        │   Redis     │
                                        └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Stockout   │◀────│  Forecast   │◀────│  Vendor     │
│  Warning    │     │   Chart     │     │  Dashboard  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Steps:**
1. Celery scheduled task runs weekly (Sunday 3 AM)
2. Task fetches 365 days of sales history per product
3. Task fetches external signals (holidays, weather, trends)
4. Feature engineering: lags, rolling stats, calendar features, external signals
5. Train three models:
   - Prophet: captures seasonality and holidays
   - LightGBM: feature-rich gradient boosting
   - N-BEATS: deep learning sequential patterns
6. Ensemble predictions with weighted average
7. Calculate confidence intervals
8. Predict stockout date and recommend restock quantity
9. Cache forecasts in Redis (TTL: 1 day)
10. Vendor dashboard fetches cached forecast on load
11. Frontend renders line chart with confidence bands
12. Display stockout countdown and restock recommendation

---

## Data Persistence Matrix

| Data | Primary Store | Cache | Backup |
|------|--------------|-------|--------|
| Users/Vendors | PostgreSQL | — | Daily pg_dump |
| Products | PostgreSQL | Redis (5 min) | Daily pg_dump |
| Orders | PostgreSQL | — | Daily pg_dump |
| Cart Items | PostgreSQL | — | Daily pg_dump |
| Conversations | PostgreSQL | — | Daily pg_dump |
| Product Embeddings | Qdrant | — | Qdrant snapshots |
| Search Index | Qdrant | — | Qdrant snapshots |
| Forecasts | Redis (1 day) | — | Regenerable |
| Analytics Results | Redis (5 min) | — | Regenerable |
| Sessions | Redis | — | — |
| Images | S3/R2 | CDN | S3 versioning |

## Event Flow (Async)

| Event | Producer | Consumer | Action |
|-------|----------|----------|--------|
| Product Created | Backend API | Celery Worker | Generate embeddings |
| Product Updated | Backend API | Celery Worker | Regenerate embeddings |
| Order Confirmed | Order Service | Celery Worker | Send confirmation email |
| Inventory Low | Inventory Check | Celery Worker | Notify vendor |
| Order Expired | Celery Beat | Celery Worker | Release held inventory |
| Forecast Retrain | Celery Beat | Celery Worker | Retrain all models |
| External Signals | Celery Beat | Celery Worker | Fetch festivals, weather |
