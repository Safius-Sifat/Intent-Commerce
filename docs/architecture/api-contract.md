# Architecture: API Contract

## Overview

This document defines the complete REST API contract between the frontend and backend. All endpoints use JSON for request/response bodies. Authentication is via Bearer token in the `Authorization` header.

## Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://api.intentcommerce.com/api/v1
```

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow this envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  },
  "meta": null
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user or vendor.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/login
Authenticate and receive token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 1800
  }
}
```

#### GET /auth/me
Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "preferences": {
      "preferred_categories": ["electronics"],
      "price_range": {"min": 20, "max": 150}
    }
  }
}
```

---

### Products

#### GET /products
Browse products (public).

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 100)
- `category` (string, optional)
- `min_price` (float, optional)
- `max_price` (float, optional)
- `search` (string, optional) — text search
- `sort` (enum, optional): `price_asc`, `price_desc`, `newest`, `popular`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prod-uuid",
        "title": "Nike Air Zoom Pegasus 40",
        "price": 129.99,
        "compare_at_price": 149.99,
        "category": "footwear",
        "vendor": {
          "id": "vendor-uuid",
          "business_name": "Sports Direct"
        },
        "images": [
          {"url": "https://cdn.example.com/img1.jpg", "is_primary": true}
        ],
        "inventory_status": "in_stock"
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 20
  }
}
```

#### GET /products/{id}
Get product details (public).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod-uuid",
    "title": "Nike Air Zoom Pegasus 40",
    "description": "Comfortable running shoes...",
    "price": 129.99,
    "compare_at_price": 149.99,
    "category": "footwear",
    "subcategory": "running-shoes",
    "tags": ["running", "shoes", "nike"],
    "brand": "Nike",
    "sku": "NK-AZP40-001",
    "inventory_count": 50,
    "status": "active",
    "attributes": {"material": "mesh", "closure": "lace-up"},
    "vendor": {
      "id": "vendor-uuid",
      "business_name": "Sports Direct"
    },
    "images": [
      {"id": "img-1", "url": "https://cdn.example.com/img1.jpg", "alt": "Side view", "is_primary": true},
      {"id": "img-2", "url": "https://cdn.example.com/img2.jpg", "alt": "Top view", "is_primary": false}
    ],
    "variants": [
      {
        "id": "var-uuid",
        "variant_name": "Black / 10",
        "sku": "NK-AZP40-BLK-10",
        "price_adjustment": 0,
        "inventory_count": 12,
        "attributes": {"color": "black", "size": "10"}
      }
    ]
  }
}
```

#### POST /products
Create product (vendor only).

**Content-Type:** `multipart/form-data`

**Fields:**
- `title` (string, required)
- `description` (string, optional)
- `price` (float, required)
- `compare_at_price` (float, optional)
- `category` (string, optional)
- `subcategory` (string, optional)
- `tags` (string, comma-separated)
- `brand` (string, optional)
- `sku` (string, optional)
- `attributes` (JSON string, optional)
- `variants` (JSON string, optional)
- `images[]` (files, optional, max 8)

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "prod-uuid",
    "title": "Nike Air Zoom Pegasus 40",
    "status": "draft",
    "vendor_id": "vendor-uuid",
    "images": [...],
    "variants": [...]
  }
}
```

#### PUT /products/{id}
Update product (vendor only, owner).

**Content-Type:** `multipart/form-data` or `application/json`

**Response (200):** Same as create.

#### DELETE /products/{id}
Archive product (vendor only, owner).

**Response (200):**
```json
{
  "success": true,
  "data": {"message": "Product archived"}
}
```

---

### Chat

#### POST /chat
Send message to AI agent (user only).

**Request:**
```json
{
  "message": "Find me red running shoes under $100",
  "session_id": "session-uuid-optional"
}
```

**Response (200):** Streamed SSE (Server-Sent Events)

```
data: {"type": "text", "content": "I found"}

data: {"type": "text", "content": " some"}

data: {"type": "text", "content": " great"}

data: {"type": "products", "items": [{"id": "prod-uuid", "title": "...", "price": 89.99, "image": "..."}]}

data: {"type": "text", "content": " options for you!"}

data: [DONE]
```

#### GET /chat/history
Get conversation history (user only).

**Query Parameters:**
- `session_id` (string, optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "session-uuid",
    "messages": [
      {
        "role": "user",
        "content": "Find me red running shoes",
        "timestamp": "2024-06-01T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "Here are some options...",
        "timestamp": "2024-06-01T10:00:05Z",
        "products": [{"id": "prod-uuid", "title": "..."}]
      }
    ]
  }
}
```

---

### Cart

#### GET /cart
Get current user's cart (user only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-uuid",
        "product": {
          "id": "prod-uuid",
          "title": "Nike Air Zoom Pegasus 40",
          "price": 129.99,
          "image": "https://cdn.example.com/img.jpg"
        },
        "variant": {
          "id": "var-uuid",
          "variant_name": "Black / 10",
          "price_adjustment": 0
        },
        "quantity": 2,
        "added_by_agent": true,
        "line_total": 259.98
      }
    ],
    "subtotal": 259.98,
    "tax_estimate": 26.00,
    "shipping_estimate": 0.00,
    "total": 285.98,
    "item_count": 2
  }
}
```

#### POST /cart/items
Add item to cart (user only).

**Request:**
```json
{
  "product_id": "prod-uuid",
  "variant_id": "var-uuid",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "cart_item_id": "cart-item-uuid",
    "cart": { /* updated full cart */ }
  }
}
```

**Errors:**
- `400`: "Insufficient inventory. Only 5 units available."
- `404`: "Product not found or not active."

#### PUT /cart/items/{id}
Update cart item quantity (user only).

**Request:**
```json
{
  "quantity": 3
}
```

**Response (200):** Updated cart.

#### DELETE /cart/items/{id}
Remove item from cart (user only).

**Response (200):** Updated cart.

#### DELETE /cart
Clear entire cart (user only).

**Response (200):** Empty cart.

---

### Orders

#### POST /orders
Initiate checkout (user only).

**Request:**
```json
{
  "address_id": "addr-uuid",
  "payment_method_id": "pm-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "order_id": "order-uuid",
    "status": "pending",
    "total": 285.98,
    "items": [
      {
        "product_id": "prod-uuid",
        "variant_id": "var-uuid",
        "quantity": 2,
        "unit_price": 129.99
      }
    ],
    "stripe_client_secret": "pi_123_secret_456",
    "expires_at": "2024-06-01T12:00:00Z"
  }
}
```

#### POST /orders/{id}/confirm
Confirm payment and finalize order (user only).

**Request:**
```json
{
  "payment_intent_id": "pi_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order_id": "order-uuid",
    "status": "paid",
    "confirmed_at": "2024-06-01T10:30:00Z",
    "estimated_delivery": "2024-06-05"
  }
}
```

**Response (Payment Failed, 400):**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment was declined by your bank."
  }
}
```

#### GET /orders
List user's orders (user only).

**Query Parameters:**
- `page`, `limit`
- `status` (optional): pending, paid, shipped, delivered, cancelled

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "order-uuid",
        "status": "paid",
        "total": 285.98,
        "item_count": 2,
        "created_at": "2024-06-01T10:00:00Z",
        "thumbnail": "https://cdn.example.com/img.jpg"
      }
    ],
    "total": 15
  }
}
```

#### GET /orders/{id}
Get order details (user only, owner).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "status": "paid",
    "total": 285.98,
    "tax_amount": 26.00,
    "shipping_amount": 0.00,
    "shipping_address": {...},
    "payment_method": {"brand": "visa", "last4": "4242"},
    "items": [...],
    "status_history": [
      {"status": "pending", "timestamp": "2024-06-01T10:00:00Z"},
      {"status": "paid", "timestamp": "2024-06-01T10:30:00Z"}
    ]
  }
}
```

---

### Vendor Orders

#### GET /vendor/orders
List orders containing vendor's products (vendor only).

**Query Parameters:**
- `status` (optional)
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "order_id": "order-uuid",
        "user_id": "user-uuid",
        "status": "paid",
        "total": 285.98,
        "vendor_items": [
          {
            "product_id": "prod-uuid",
            "variant_id": "var-uuid",
            "quantity": 2,
            "unit_price": 129.99,
            "product_title": "Nike Air Zoom"
          }
        ],
        "created_at": "2024-06-01T10:00:00Z"
      }
    ],
    "total": 45
  }
}
```

#### PUT /vendor/orders/{order_id}/items/{item_id}/status
Update item status (vendor only, for their items).

**Request:**
```json
{
  "status": "shipped",
  "tracking_number": "1Z999AA10123456784"
}
```

**Response (200):** Updated order item.

---

### Analytics

#### POST /analytics/query
Natural language analytics query (vendor only).

**Request:**
```json
{
  "prompt": "What were my top 5 products by revenue last month?",
  "date_range": {
    "start": "2024-04-01T00:00:00Z",
    "end": "2024-04-30T23:59:59Z"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "query": "What were my top 5 products by revenue last month?",
    "summary": "Your top product was Nike Air Zoom with $4,200 in revenue.",
    "data": [
      {"product": "Nike Air Zoom", "revenue": 4200, "units": 32}
    ],
    "chart_spec": {
      "type": "bar",
      "x": "product",
      "y": "revenue",
      "title": "Top Products by Revenue - April 2024"
    },
    "sql": "SELECT ...",
    "execution_time_ms": 145
  }
}
```

#### GET /analytics/dashboard
Pre-computed dashboard metrics (vendor only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "revenue_today": 1234.50,
      "revenue_change": 15.2,
      "orders_today": 12,
      "orders_change": -5.0,
      "aov": 102.88,
      "conversion_rate": 3.2,
      "low_stock_count": 3
    },
    "top_products": [...],
    "recent_orders": [...],
    "alerts": [
      {"type": "low_stock", "product_id": "prod-uuid", "product_title": "Nike Air Zoom", "inventory": 2}
    ]
  }
}
```

#### GET /analytics/forecast/{product_id}
Get demand forecast for a product (vendor only, owner).

**Query Parameters:**
- `horizon` (int, default: 30): days to forecast

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product_id": "prod-uuid",
    "forecast": {
      "dates": ["2024-05-01", "2024-05-02", ...],
      "predicted_demand": [12, 15, 14, ...],
      "confidence_lower": [10, 12, 11, ...],
      "confidence_upper": [14, 18, 17, ...]
    },
    "stockout_date": "2024-05-28",
    "days_until_stockout": 12,
    "recommended_restock": 500,
    "confidence": "high",
    "upcoming_events": [
      {"name": "Ramadan", "date": "2024-05-15", "expected_impact": "2x demand"}
    ]
  }
}
```

---

### User Addresses

#### GET /users/addresses
Get saved addresses (user only).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "addr-uuid",
      "name": "Home",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US",
      "phone": "+1-555-0100",
      "is_default": true
    }
  ]
}
```

#### POST /users/addresses
Add new address (user only).

**Request:**
```json
{
  "name": "Office",
  "street": "456 Business Ave",
  "city": "New York",
  "state": "NY",
  "zip": "10002",
  "country": "US",
  "phone": "+1-555-0200",
  "is_default": false
}
```

**Response (201):** Created address.

---

### Webhooks

#### POST /webhooks/stripe
Stripe webhook endpoint.

**Headers:**
```
Stripe-Signature: <signature>
```

**Response (200):** Acknowledged (always return 200 for webhooks).

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `PAYMENT_FAILED` | 400 | Stripe payment declined |
| `INSUFFICIENT_INVENTORY` | 400 | Not enough stock |
| `EMBEDDING_ERROR` | 500 | Vector generation failed |

## Pagination

All list endpoints use cursor-based or offset pagination:

```
GET /products?page=1&limit=20
```

Response includes:
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 10/minute |
| `POST /auth/register` | 5/minute |
| `POST /chat` | 30/minute |
| `GET /products` | 100/minute |
| `POST /cart/items` | 60/minute |
| `POST /orders` | 10/minute |
| `POST /analytics/query` | 30/minute |

## WebSocket (Future)

Real-time features may use WebSockets:
- `wss://api.intentcommerce.com/ws/chat` — Bidirectional chat (alternative to SSE)
- `wss://api.intentcommerce.com/ws/inventory` — Live inventory updates

For MVP, SSE is sufficient for chat streaming.
