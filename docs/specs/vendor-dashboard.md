# Specification: Vendor AI Dashboard

## Overview

The vendor dashboard is the nerve center for sellers. It goes beyond traditional analytics by incorporating natural language queries, AI-generated insights, and demand forecasting. Vendors can ask questions in plain English and receive visualizations, forecasts, and actionable recommendations.

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Search/Ask Bar          [Notifications] [Profile]│
├──────────┬──────────────────────────────────────────────────┤
│          │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│ SIDEBAR  │  │   Revenue   │  │   Orders   │  │  Stock   │  │
│          │  │   Today     │  │   Today    │  │  Alerts  │  │
│ Dashboard│  │   $1,234    │  │    12      │  │   ⚠️ 3   │  │
│ Products │  └─────────────┘  └─────────────┘  └──────────┘  │
│ Orders   │                                                     │
│ Analytics│  ┌─────────────────────────────────────────────┐    │
│ Settings │  │         Demand Forecast Chart               │    │
│          │  │  [Line chart: predicted vs actual]          │    │
│          │  │  [Shaded confidence interval]               │    │
│          │  │  [Event annotations: "Diwali spike"]        │    │
│          │  └─────────────────────────────────────────────┘    │
│          │                                                     │
│          │  ┌─────────────────────────────────────────────┐    │
│          │  │         Natural Language Query Bar            │    │
│          │  │  ["Ask anything about your business..."]      │    │
│          │  │  [? icon: "Try: What were my top products?"]  │    │
│          │  └─────────────────────────────────────────────┘    │
│          │                                                     │
│          │  ┌─────────────────────────────────────────────┐    │
│          │  │         Recent Orders / Activity Feed         │    │
│          │  └─────────────────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────────────┘
```

## Sidebar Navigation

| Route | Icon | Description |
|-------|------|-------------|
| `/vendor` | LayoutDashboard | Overview dashboard with KPIs |
| `/vendor/products` | Package | Product management (list, add, edit) |
| `/vendor/orders` | ShoppingBag | Order management and fulfillment |
| `/vendor/analytics` | BarChart3 | Deep analytics with NL queries |
| `/vendor/forecasting` | TrendingUp | Demand forecasting per product |
| `/vendor/settings` | Settings | Store settings, payment config |

## Dashboard Widgets

### 1. Metric Cards (KPIs)

```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;        // percentage change
  changePeriod: string;  // "vs yesterday", "vs last week"
  sparklineData: number[]; // last 7 days
  status: "up" | "down" | "neutral";
}
```

**Metrics:**
- Revenue (today, this week, this month)
- Orders (today, this week, this month)
- Average Order Value (AOV)
- Conversion Rate
- Top Product (by revenue)
- Stock Alerts (low inventory count)

### 2. Demand Forecast Widget

- Mini line chart (last 30 days actual + next 14 days predicted)
- Stockout countdown: "Stock out in 12 days"
- Recommended restock: "Order 500 units by June 5th"
- Upcoming events: "Diwali in 14 days — expect 3x demand"

### 3. Activity Feed

- Recent orders (last 5) with status badges
- Low stock alerts with direct links to product edit
- Anomaly alerts ("Sales dropped 20% this week")

### 4. Top Products Table

| Rank | Product | Revenue | Units Sold | Trend |
|------|---------|---------|------------|-------|
| 1 | Nike Air Zoom | $4,200 | 32 | ↑ 15% |
| 2 | Yoga Mat Pro | $1,800 | 45 | ↑ 8% |

## Natural Language Query Interface

### Query Input

```
┌─────────────────────────────────────────────┐
│  [Ask AI]  What were my top 5 products by   │
│            revenue last month?              │
│            [Submit]                         │
└─────────────────────────────────────────────┘
```

### Response Layout

```
┌─────────────────────────────────────────────┐
│  AI Summary                                 │
│  "Your top product was Nike Air Zoom with   │
│   $4,200 in revenue, up 15% from March."  │
├─────────────────────────────────────────────┤
│  [Bar Chart: Products vs Revenue]           │
│                                             │
│    $5k ┤                                    │
│    $4k ┤    ████                            │
│    $3k ┤    ████  ███                       │
│    $2k ┤    ████  ███  ██                   │
│    $1k ┤    ████  ███  ██  █                │
│      $ └──────────────────────────          │
│           A    B    C    D    E             │
├─────────────────────────────────────────────┤
│  Data Table                                 │
│  ┌──────────────┬───────────┬──────────┐   │
│  │ Product      │ Revenue   │ Units    │   │
│  │ Nike Air Zoom│ $4,200    │ 32       │   │
│  │ ...          │ ...       │ ...      │   │
│  └──────────────┴───────────┴──────────┘   │
└─────────────────────────────────────────────┘
```

### Supported Query Patterns

| Pattern | Example |
|---------|---------|
| Top N by metric | "Top 10 products by revenue this month" |
| Time comparison | "Compare this month's sales to last month" |
| Trend analysis | "Show me daily sales for the last 30 days" |
| Category breakdown | "Revenue by category" |
| Inventory | "Which products are low on stock?" |
| Customer behavior | "What products are often bought together?" |
| Anomaly | "Did anything unusual happen this week?" |

## API Endpoints

### Dashboard Metrics

```
GET /api/v1/analytics/dashboard
Authorization: Bearer <vendor_token>

Response 200:
{
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
  "alerts": [...]
}
```

### Natural Language Query

```
POST /api/v1/analytics/query
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "prompt": "What were my top 5 products by revenue last month?",
  "date_range": {
    "start": "2024-04-01T00:00:00Z",
    "end": "2024-04-30T23:59:59Z"
  }
}

Response 200:
{
  "query": "What were my top 5 products by revenue last month?",
  "summary": "Your top product was Nike Air Zoom with $4,200 in revenue.",
  "data": [
    {"product": "Nike Air Zoom", "revenue": 4200, "units": 32},
    ...
  ],
  "chart_spec": {
    "type": "bar",
    "x": "product",
    "y": "revenue",
    "title": "Top Products by Revenue - April 2024"
  },
  "sql": "SELECT ...",  // For transparency/debugging
  "execution_time_ms": 145
}
```

### Demand Forecast

```
GET /api/v1/analytics/forecast/{product_id}?horizon=30
Authorization: Bearer <vendor_token>

Response 200:
{
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
  "confidence": "high",  // high, medium, low
  "upcoming_events": [
    {"name": "Ramadan", "date": "2024-05-15", "expected_impact": "2x demand"}
  ]
}
```

## Widget Customization

Vendors can customize their dashboard layout:

```typescript
interface DashboardConfig {
  layout: {
    widgets: Array<{
      id: string;
      type: "metric" | "chart" | "table" | "forecast" | "feed";
      position: { x: number; y: number; w: number; h: number };
      config: Record<string, any>;
    }>;
  };
}
```

**Actions:**
- Add/remove widgets
- Drag to reorder (optional: manual reorder via dropdown is fine for MVP)
- Configure widget-specific settings (e.g., date range for charts)

Saved to `vendor.dashboard_config` JSONB.

## Implementation Checklist

- [ ] Dashboard layout component with sidebar + header + content area
- [ ] Protected vendor routes (redirect if not vendor)
- [ ] Metric card component with sparkline
- [ ] Top products table component
- [ ] Activity feed component
- [ ] Stock alert component with links
- [ ] Natural language query input component
- [ ] Dynamic chart renderer (maps chart_spec to Recharts)
- [ ] Data table component for query results
- [ ] AI summary text component
- [ ] Demand forecast chart with confidence intervals
- [ ] Event annotation overlays on charts
- [ ] Dashboard customization UI (add/remove widgets)
- [ ] Save/load dashboard config to backend
- [ ] Responsive layout (sidebar collapses on mobile)
- [ ] Loading skeletons for all widgets
- [ ] Empty states (no orders, no products)

## Testing Scenarios

1. Vendor logs in → dashboard loads with correct metrics
2. Vendor asks NL query → gets chart + table + summary
3. Vendor views forecast → sees predicted demand + stockout warning
4. Vendor sees low stock alert → clicks link → edits product inventory
5. Vendor customizes dashboard → removes widget → saves → reloads → layout persists
6. Mobile view → sidebar collapses to hamburger menu
7. Vendor with no orders → empty state shown
8. NL query returns no data → "No results found" message
9. Chart responsiveness → resizes with browser window
