# Specification: Demand Forecasting Engine

## Overview

The demand forecasting engine predicts future sales for each product using an ensemble of statistical and machine learning models. It incorporates both internal sales data and external signals (festivals, weather, trends) to produce actionable forecasts for inventory planning.

## Forecasting Targets

For each `(vendor_id, product_id)` or `(vendor_id, category)`:

1. **Daily Demand Quantity**: Predicted units sold per day
2. **Revenue Forecast**: Predicted revenue per day (demand × price)
3. **Stockout Prediction**: Date when current inventory will reach zero
4. **Restock Recommendation**: Optimal quantity and timing for next order

## Data Dependencies

### Internal Data Sources

| Source | Table | Fields | Frequency |
|--------|-------|--------|-----------|
| Sales History | `order_items` + `orders` | `quantity, unit_price, created_at` | Daily aggregation |
| Inventory Movement | `inventory_transactions` | `quantity_change, transaction_type, created_at` | Real-time |
| Product Catalog | `products` | `category, subcategory, price, attributes` | Static |
| Pricing History | `products` (track changes) | `price, compare_at_price over time` | On change |

### External Data Sources

| Signal | API | Data | How Used |
|--------|-----|------|----------|
| Holidays/Festivals | Nager.Date API | Public holidays by country | Binary feature `is_holiday` |
| Regional Festivals | Google Calendar API / Manual | Religious/cultural events | Category-mapped features |
| Weather | OpenWeatherMap | Temperature, precipitation | Numeric features per region |
| Trends | Google Trends | Search volume index | Leading indicator, 0-100 scale |
| Local Events | Manual / Event APIs | Concerts, sports, markets | Event-mapped spikes |

## Feature Engineering

### Time-Based Features

```python
features = {
    # Calendar
    "day_of_week": 0-6,
    "month": 1-12,
    "day_of_month": 1-31,
    "is_weekend": bool,
    "is_month_start": bool,
    "is_month_end": bool,
    "quarter": 1-4,
    "year": int,
    
    # Cyclical encoding (sine/cosine for circular nature)
    "day_of_week_sin": sin(2π * day_of_week / 7),
    "day_of_week_cos": cos(2π * day_of_week / 7),
    "month_sin": sin(2π * month / 12),
    "month_cos": cos(2π * month / 12),
}
```

### Lag & Rolling Features

```python
features = {
    # Lag features
    "sales_lag_1d": sales.shift(1),
    "sales_lag_7d": sales.shift(7),
    "sales_lag_14d": sales.shift(14),
    "sales_lag_30d": sales.shift(30),
    "sales_lag_365d": sales.shift(365),  # Same day last year
    
    # Rolling statistics
    "sales_roll_mean_7d": sales.rolling(7).mean(),
    "sales_roll_mean_30d": sales.rolling(30).mean(),
    "sales_roll_std_7d": sales.rolling(7).std(),
    "sales_roll_max_7d": sales.rolling(7).max(),
    
    # Expanding statistics
    "sales_expanding_mean": sales.expanding().mean(),
}
```

### External Signal Features

```python
features = {
    "is_holiday": bool,
    "is_festival": bool,
    "festival_days_until": int,  # Days until nearest festival
    "temperature_avg": float,
    "temperature_max": float,
    "precipitation_mm": float,
    "trend_index": float,  # 0-100
    "trend_index_change_7d": float,
    "local_event_count": int,
}
```

### Product Features

```python
features = {
    "category": categorical,
    "subcategory": categorical,
    "price": float,
    "compare_at_price": float,
    "discount_rate": (compare_at_price - price) / compare_at_price,
    "days_since_last_restock": int,
    "days_since_launch": int,
    "inventory_turnover_30d": sales_30d / avg_inventory,
}
```

## Model Ensemble

### Model 1: Prophet (Statistical Baseline)

```python
from prophet import Prophet

model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    holidays=holiday_df,  # Custom holidays/festivals
    changepoint_prior_scale=0.05,
    seasonality_prior_scale=10.0
)

# Add custom seasonality for festivals
model.add_seasonality(
    name='festival_season',
    period=30.5,  # Monthly
    fourier_order=5
)

model.fit(df[['ds', 'y']])
future = model.make_future_dataframe(periods=30)
forecast = model.predict(future)
```

**Strengths:**
- Handles seasonality automatically
- Robust to missing data
- Interpretable (trend, seasonality components)
- Fast to train

**Weaknesses:**
- Assumes linear relationships
- Limited feature support
- Doesn't capture cross-product effects

### Model 2: LightGBM (Gradient Boosting)

```python
import lightgbm as lgb

# Feature matrix X with all engineered features
# Target y: daily sales quantity

train_data = lgb.Dataset(X_train, label=y_train)
valid_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

params = {
    'objective': 'regression',
    'metric': 'mae',
    'boosting_type': 'gbdt',
    'num_leaves': 31,
    'learning_rate': 0.05,
    'feature_fraction': 0.9,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'verbose': -1
}

model = lgb.train(
    params,
    train_data,
    num_boost_round=1000,
    valid_sets=[valid_data],
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)]
)
```

**Strengths:**
- Handles non-linear relationships
- Excellent with tabular features
- Fast training and prediction
- Feature importance for interpretability

**Weaknesses:**
- Requires careful feature engineering
- Doesn't model temporal dependencies explicitly
- Can overfit with small datasets

### Model 3: NeuralForecast N-BEATS (Deep Learning)

```python
from neuralforecast import NeuralForecast
from neuralforecast.models import NBEATS

models = [
    NBEATS(
        h=30,  # Forecast horizon
        input_size=60,  # Lookback window
        max_steps=100,
        val_check_steps=10,
        early_stop_patience_steps=5
    )
]

nf = NeuralForecast(models=models, freq='D')
nf.fit(df=Y_df)
forecasts = nf.predict()
```

**Strengths:**
- Captures complex sequential patterns
- Handles multiple time series simultaneously
- Good for products with rich history

**Weaknesses:**
- Requires more data
- Slower to train
- Less interpretable
- Cold start problem for new products

### Ensemble Strategy

```python
def ensemble_forecast(prophet_pred, lgbm_pred, nbeats_pred, weights=None):
    """
    Weighted average of all model predictions.
    """
    if weights is None:
        weights = {
            'prophet': 0.3,
            'lightgbm': 0.4,
            'nbeats': 0.3
        }
    
    # Normalize weights
    total = sum(weights.values())
    weights = {k: v/total for k, v in weights.items()}
    
    ensemble = (
        weights['prophet'] * prophet_pred +
        weights['lightgbm'] * lgbm_pred +
        weights['nbeats'] * nbeats_pred
    )
    
    return ensemble
```

**Dynamic Weights:**
- Products with > 180 days history: higher weight on N-BEATS
- Products with 30-180 days: equal weights
- Products with < 30 days: high weight on Prophet (better priors)
- Seasonal products (apparel, decor): boost Prophet weight
- Trend-driven products (electronics): boost LightGBM weight

## Stockout Prediction

```python
def predict_stockout(forecast, current_inventory, lead_time_days=7):
    """
    Predict when inventory will reach zero.
    """
    cumulative_demand = np.cumsum(forecast['predicted_demand'])
    
    # Find first day where cumulative demand > current inventory
    stockout_idx = np.where(cumulative_demand > current_inventory)[0]
    
    if len(stockout_idx) > 0:
        stockout_day = stockout_idx[0]
        stockout_date = forecast['dates'][stockout_day]
        
        # Recommended restock: cover demand until next restock cycle
        days_until_next_restock = stockout_day - lead_time_days
        if days_until_next_restock > 0:
            recommended_qty = int(
                cumulative_demand[min(stockout_day + 30, len(cumulative_demand)-1)] 
                - current_inventory
            )
        else:
            # Urgent: stock out before lead time
            recommended_qty = int(cumulative_demand[-1] * 1.5)  # 50% buffer
    else:
        stockout_date = None
        recommended_qty = 0
    
    return {
        "stockout_date": stockout_date,
        "days_until_stockout": stockout_day if len(stockout_idx) > 0 else None,
        "recommended_restock_quantity": recommended_qty,
        "urgency": "high" if stockout_day and stockout_day <= 7 else "medium" if stockout_day and stockout_day <= 14 else "low"
    }
```

## Confidence Intervals

```python
def calculate_confidence_interval(predictions, model_std):
    """
    Calculate prediction intervals.
    """
    # For Prophet: use built-in yhat_lower, yhat_upper
    # For LightGBM: use quantile regression (train 3 models: 0.1, 0.5, 0.9)
    # For N-BEATS: use Monte Carlo dropout or bootstrap
    
    lower = predictions - 1.96 * model_std  # 95% CI
    upper = predictions + 1.96 * model_std
    
    return {"lower": lower, "upper": upper}
```

## Cold Start Handling

For products with insufficient history (< 30 days):

```python
def cold_start_forecast(product, similar_products, category_average):
    """
    Use transfer learning from similar products.
    """
    # Find similar products (same category, similar price, similar attributes)
    similar = find_similar_products(product, n=5)
    
    # Weighted average of similar product forecasts
    weights = calculate_similarity_weights(product, similar)
    base_forecast = weighted_average([s.forecast for s in similar], weights)
    
    # Adjust by category growth trend
    category_trend = get_category_trend(product.category)
    adjusted_forecast = base_forecast * (1 + category_trend)
    
    # Apply new product launch curve (initial spike, then normalize)
    launch_curve = get_launch_curve(product.days_since_launch)
    final_forecast = adjusted_forecast * launch_curve
    
    return final_forecast, confidence="low"
```

## Scheduled Retraining

```python
@celery_app.task
def retrain_forecasting_models():
    """
    Run weekly (Sunday at 3 AM).
    """
    products = get_products_with_min_history(days=14)
    
    for product in products:
        # Fetch latest data
        sales = fetch_sales_history(product.id, days=365)
        signals = fetch_external_signals(product.category, product.vendor.region)
        
        # Engineer features
        features = engineer_features(sales, signals, product)
        
        # Train all models
        prophet_model = train_prophet(sales)
        lgbm_model = train_lightgbm(features)
        nbeats_model = train_nbeats(sales)
        
        # Save models (pickle or joblib)
        save_model(product.id, 'prophet', prophet_model)
        save_model(product.id, 'lightgbm', lgbm_model)
        save_model(product.id, 'nbeats', nbeats_model)
    
    # Cache forecasts in Redis
    cache_forecasts()
```

## Implementation Checklist

- [ ] `external_signals` table and ingestion pipeline
- [ ] Feature engineering module (`src/forecasting/features.py`)
- [ ] Prophet model wrapper
- [ ] LightGBM model wrapper with quantile regression
- [ ] N-BEATS model wrapper
- [ ] Ensemble aggregation logic
- [ ] Stockout prediction function
- [ ] Confidence interval calculation
- [ ] Cold start / transfer learning logic
- [ ] Model persistence (save/load trained models)
- [ ] Weekly retraining Celery task
- [ ] Forecast caching in Redis
- [ ] Forecast API endpoint
- [ ] Vendor forecast chart component
- [ ] Restock recommendation algorithm

## Testing Scenarios

1. Product with 365 days history → forecast with high confidence
2. Product with 14 days history → uses cold start, shows low confidence warning
3. Product with seasonal pattern (Diwali decor) → Prophet captures seasonality
4. Product with trend (new phone model) → LightGBM captures trend
5. Stockout prediction → current inventory 100, forecast shows 0 in 12 days
6. External signal impact → festival forecast shows 3x spike
7. Model comparison → ensemble beats any single model on test set
8. Retraining job → completes without errors, models updated
9. Forecast caching → second request returns cached result instantly
10. Edge case: product with zero sales history → graceful fallback
