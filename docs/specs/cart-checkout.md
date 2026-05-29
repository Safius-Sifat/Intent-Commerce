# Specification: Cart & Checkout System

## Overview

The cart is the **source of truth** for a user's shopping intent. It lives in PostgreSQL, not in the agent's memory. This ensures that:
- The cart persists across page refreshes
- The web UI and chat agent see the same cart state
- Multiple tabs/devices stay synchronized
- Checkout can proceed reliably even if the chat session ends

## Data Model

### Cart Item

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK → users.id, indexed | Owner |
| product_id | UUID | FK → products.id | Product |
| variant_id | UUID | FK → product_variants.id, NULL | Selected variant |
| quantity | INTEGER | DEFAULT 1, > 0 | Number of units |
| added_by_agent | BOOLEAN | DEFAULT FALSE | Track AI vs manual add |
| created_at | TIMESTAMPTZ | DEFAULT now() | When added |

### Cart Response Format

```json
{
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
        "price_adjustment": 0,
        "attributes": {"color": "black", "size": "10"}
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
```

## Cart API Endpoints

### Get Cart

```
GET /api/v1/cart
Authorization: Bearer <user_token>

Response 200: Cart object (see above)
```

### Add to Cart

```
POST /api/v1/cart/items
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "product_id": "prod-uuid",
  "variant_id": "var-uuid",  // optional
  "quantity": 2
}

Response 201:
{
  "cart_item_id": "cart-item-uuid",
  "cart": { /* updated full cart */ }
}

Error 400: "Insufficient inventory. Only 5 units available."
Error 404: "Product not found or not active."
```

### Update Cart Item Quantity

```
PUT /api/v1/cart/items/{cart_item_id}
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "quantity": 3
}

Response 200: Updated cart
```

### Remove from Cart

```
DELETE /api/v1/cart/items/{cart_item_id}
Authorization: Bearer <user_token>

Response 200: Updated cart
```

### Clear Cart

```
DELETE /api/v1/cart
Authorization: Bearer <user_token>

Response 200: Empty cart
```

## Cart Business Rules

1. **One cart per user**: Cart items are implicitly tied to the user; no explicit "cart" entity
2. **Duplicate handling**: If adding same product+variant, increment quantity (max: inventory_count)
3. **Inventory validation**: Cannot add more than available stock
4. **Product validation**: Product must be active
5. **Variant validation**: If variant specified, it must belong to the product
6. **Price calculation**: `line_total = (product.price + variant.price_adjustment) * quantity`
7. **Agent tracking**: `added_by_agent` field distinguishes AI-initiated vs manual additions

## Checkout Flow

### Step 1: Initiate Checkout

```
POST /api/v1/orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "address_id": "addr-uuid",
  "payment_method_id": "pm-uuid"
}

Response 201:
{
  "order_id": "order-uuid",
  "status": "pending",
  "total": 285.98,
  "items": [...],
  "stripe_client_secret": "pi_123_secret_456",
  "expires_at": "2024-06-01T12:00:00Z"  // 30 min hold
}
```

**Backend Actions:**
1. Validate cart is not empty
2. Validate address belongs to user
3. Validate payment method belongs to user
4. Create order with status "pending"
5. Create order_items from cart_items
6. **Hold inventory**: Decrease `inventory_count` for each product/variant
7. Log inventory transactions (type: "hold")
8. Create Stripe PaymentIntent
9. Set expiry: if not confirmed in 30 minutes, release inventory

### Step 2: Frontend Confirms Payment

```javascript
// Frontend uses Stripe.js
const { error } = await stripe.confirmCardPayment(client_secret, {
  payment_method: payment_method_id
});

if (error) {
  // Show error, order remains pending
} else {
  // Call backend to confirm
}
```

### Step 3: Confirm Payment

```
POST /api/v1/orders/{order_id}/confirm
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "payment_intent_id": "pi_123"
}

Response 200:
{
  "order_id": "order-uuid",
  "status": "paid",
  "confirmed_at": "2024-06-01T10:30:00Z",
  "estimated_delivery": "2024-06-05"
}
```

**Backend Actions:**
1. Verify payment intent status with Stripe API
2. If payment successful:
   - Update order status to "paid"
   - Convert inventory "hold" to "sale" (log transactions)
   - Clear user's cart
   - Send confirmation response
3. If payment failed:
   - Update order status to "cancelled"
   - Release held inventory (increase counts back)
   - Log inventory transactions (type: "release")
   - Return error with reason

### Step 4: Stripe Webhook (Async Confirmation)

```
POST /api/v1/webhooks/stripe
Stripe-Signature: <signature>

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123",
      "status": "succeeded"
    }
  }
}

Response 200: Acknowledged
```

**Webhook Handler:**
1. Verify Stripe signature using `STRIPE_WEBHOOK_SECRET`
2. If `payment_intent.succeeded`:
   - Find order by payment_intent_id
   - Confirm order if not already confirmed
3. If `payment_intent.payment_failed`:
   - Cancel order and release inventory

## Inventory Hold Mechanism

```python
class InventoryService:
    async def hold_inventory(self, order_id: str, items: List[Dict]):
        """
        Reserve inventory for 30 minutes.
        """
        async with self.db.transaction():
            for item in items:
                # Deduct from product inventory
                await self.db.execute(
                    """
                    UPDATE products 
                    SET inventory_count = inventory_count - :qty
                    WHERE id = :pid AND inventory_count >= :qty
                    """,
                    {"pid": item["product_id"], "qty": item["quantity"]}
                )
                
                # Deduct from variant inventory
                if item.get("variant_id"):
                    await self.db.execute(
                        """
                        UPDATE product_variants
                        SET inventory_count = inventory_count - :qty
                        WHERE id = :vid AND inventory_count >= :qty
                        """,
                        {"vid": item["variant_id"], "qty": item["quantity"]}
                    )
                
                # Log transaction
                await self.db.execute(
                    """
                    INSERT INTO inventory_transactions 
                    (product_id, variant_id, transaction_type, quantity_change, order_id, running_balance)
                    VALUES (:pid, :vid, 'hold', -:qty, :oid, 
                        (SELECT inventory_count FROM products WHERE id = :pid))
                    """,
                    {"pid": item["product_id"], "vid": item.get("variant_id"), 
                     "qty": item["quantity"], "oid": order_id}
                )
    
    async def release_inventory(self, order_id: str):
        """
        Release held inventory when order expires or is cancelled.
        """
        # Find all hold transactions for this order
        holds = await self.db.fetch_all(
            "SELECT * FROM inventory_transactions WHERE order_id = :oid AND transaction_type = 'hold'",
            {"oid": order_id}
        )
        
        async with self.db.transaction():
            for hold in holds:
                qty = abs(hold["quantity_change"])
                
                # Restore product inventory
                await self.db.execute(
                    "UPDATE products SET inventory_count = inventory_count + :qty WHERE id = :pid",
                    {"pid": hold["product_id"], "qty": qty}
                )
                
                # Restore variant inventory
                if hold["variant_id"]:
                    await self.db.execute(
                        "UPDATE product_variants SET inventory_count = inventory_count + :qty WHERE id = :vid",
                        {"vid": hold["variant_id"], "qty": qty}
                    )
                
                # Log release
                await self.db.execute(
                    """
                    INSERT INTO inventory_transactions 
                    (product_id, variant_id, transaction_type, quantity_change, order_id, running_balance)
                    VALUES (:pid, :vid, 'release', :qty, :oid,
                        (SELECT inventory_count FROM products WHERE id = :pid))
                    """,
                    {"pid": hold["product_id"], "vid": hold["variant_id"], 
                     "qty": qty, "oid": order_id}
                )
```

## Order Status Lifecycle

```
Pending → Paid → Shipped → Delivered
   ↓       ↓       ↓
Cancelled Refund  Return
```

| Status | Description |
|--------|-------------|
| **Pending** | Order created, inventory held, awaiting payment |
| **Paid** | Payment confirmed, inventory deducted, order confirmed |
| **Shipped** | Vendor marked items as shipped |
| **Delivered** | Customer received order |
| **Cancelled** | Payment failed or user cancelled before payment |
| **Refunded** | Refund processed after payment |

## Celery Scheduled Tasks

### Inventory Hold Expiry

```python
@celery_app.task
def expire_pending_orders():
    """
    Run every 5 minutes.
    Find orders pending > 30 minutes and release inventory.
    """
    expired = db.fetch_all(
        """
        SELECT id FROM orders 
        WHERE status = 'pending' 
        AND created_at < NOW() - INTERVAL '30 minutes'
        """
    )
    
    for order in expired:
        inventory_service.release_inventory(order["id"])
        db.execute(
            "UPDATE orders SET status = 'cancelled' WHERE id = :id",
            {"id": order["id"]}
        )
```

## Implementation Checklist

- [ ] CartItem SQLAlchemy model
- [ ] Order and OrderItem SQLAlchemy models
- [ ] `GET /cart` endpoint
- [ ] `POST /cart/items` endpoint (with inventory validation)
- [ ] `PUT /cart/items/{id}` endpoint
- [ ] `DELETE /cart/items/{id}` endpoint
- [ ] `DELETE /cart` endpoint (clear cart)
- [ ] `POST /orders` endpoint (initiate checkout)
- [ ] `POST /orders/{id}/confirm` endpoint
- [ ] Stripe PaymentIntent creation
- [ ] Stripe webhook handler with signature verification
- [ ] Inventory hold mechanism
- [ ] Inventory release mechanism
- [ ] Inventory transaction logging
- [ ] Celery task for expiring pending orders
- [ ] Frontend cart drawer/page with quantity editing
- [ ] Frontend checkout flow (address, payment, confirmation)
- [ ] Frontend order confirmation page

## Testing Scenarios

1. Add item to cart → cart reflects item → refresh page → cart still there
2. Add same product twice → quantity increments → not duplicate items
3. Add more than inventory → error with available quantity
4. Add inactive product → 404 error
5. Checkout with empty cart → error
6. Checkout → order created → inventory held → cart still visible
7. Confirm payment → order paid → inventory permanently deducted → cart cleared
8. Let order expire (30 min) → inventory released → order cancelled
9. Payment fails → inventory released → order cancelled
10. Stripe webhook with invalid signature → rejected 401
11. Vendor updates product inventory → available stock reflects in cart validation
