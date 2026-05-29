# Sprint 2: Conversational AI

**Duration:** Weeks 5-7  
**Goal:** A user can chat with an AI agent to discover products, add them to cart, and complete checkout through natural language. The agent remembers context and handles the full shopping lifecycle.

## Sprint 2 Overview

This is the core differentiator of Intent Commerce. We transform from a traditional e-commerce site into a conversational marketplace. The sprint focuses on:
1. Hybrid RAG product retrieval
2. LangGraph shopping agent with tools
3. Real-time streaming chat UI
4. Agent-driven cart operations
5. Conversational checkout flow

---

## Stories

### S2-P1-001: Hybrid RAG Retrieval Pipeline

**As a** shopper  
**I want** the AI to find relevant products based on my natural language description  
**So that** I don't need to know exact product names or categories

#### Acceptance Criteria
- **Given** I say "I need comfortable running shoes for marathons under $100"
- **When** the agent processes my message
- **Then** it retrieves products matching "running shoes" + "comfortable" + "marathon"
- **And** results are filtered by price <= 100
- **And** products are ranked by relevance
- **And** the top 5 products are shown in the chat

- **Given** I upload an image of a dress I like
- **When** I say "Find me something similar to this"
- **Then** the agent uses the image embedding to find visually similar products
- **And** combines with any text description I provide

#### Technical Notes
- Implement hybrid search:
  1. Dense retrieval: BGE-M3 query embedding → Qdrant similarity search
  2. Sparse retrieval: SPLADE/BM25-style keyword matching (use Qdrant's sparse vectors or full-text search)
  3. Reciprocal Rank Fusion (RRF) to merge results
- Pre-filter Qdrant search by `status = "active"` and `inventory_count > 0`
- For image search: encode uploaded image with SigLIP, search image_embedding field
- Re-rank top 20 results with a cross-encoder (optional, if latency allows)
- Response format: list of product IDs with relevance scores

#### Dependencies
- S0-P1-001 (Qdrant collection)
- S0-P1-002 (embedding models)
- S1-P5-002 (background embedding jobs)

#### Assigned To
- Person 1 (AI/ML Lead)

#### Estimation
- 12 hours

---

### S2-P1-002: LangGraph Agent State Machine

**As a** system  
**I want** the shopping agent to be a proper state machine with loops and conditional branching  
**So that** complex multi-turn conversations work correctly

#### Acceptance Criteria
- **Given** the agent receives a user message
- **When** it enters the state graph
- **Then** it classifies intent: `search`, `add_to_cart`, `remove_from_cart`, `checkout`, `question`, `clarification`

- **Given** the intent is `search`
- **When** no products match exactly
- **Then** the agent retrieves similar products and says: "I couldn't find exactly that, but here are close matches..."

- **Given** the intent is `checkout`
- **When** the cart is empty
- **Then** the agent says "Your cart is empty. What would you like to buy?"
- **And** routes back to search state

- **Given** the intent requires missing info (e.g., checkout without address)
- **When** the agent detects the gap
- **Then** it asks the user for the missing information
- **And** waits for the response before proceeding

#### Technical Notes
- Use LangGraph `StateGraph` with typed state:
  ```python
  class AgentState(TypedDict):
      messages: list
      intent: str
      retrieved_products: list
      cart_actions: list
      missing_info: list
      response: str
  ```
- Nodes: `classify_intent`, `retrieve_products`, `check_inventory`, `manage_cart`, `checkout_orchestrator`, `format_response`
- Conditional edges based on intent and state
- Add retry logic for LLM failures
- Implement conversation memory: load previous messages from DB, append new ones

#### Dependencies
- S2-P1-001 (retrieval works)

#### Assigned To
- Person 1 (AI/ML Lead)

#### Estimation
- 10 hours

---

### S2-P1-003: Agent Tools Implementation

**As a** shopping agent  
**I want** functional tools to interact with the commerce system  
**So that** I can help users complete purchases

#### Acceptance Criteria
- **Given** the agent needs to find products
- **When** it calls `search_products(query, filters)`
- **Then** it receives a list of matching products from the RAG pipeline

- **Given** the agent wants to show a product
- **When** it calls `check_inventory(product_id)`
- **Then** it receives `{available: bool, qty: int}`
- **And** if not available, the agent offers alternatives

- **Given** the user says "Add the red shoes to my cart"
- **When** the agent calls `add_to_cart(user_id, product_id, qty)`
- **Then** the item is persisted to the database
- **And** the agent confirms: "Added Red Running Shoes (Size 10) to your cart"

- **Given** the user says "What's in my cart?"
- **When** the agent calls `get_cart(user_id)`
- **Then** it receives the full cart with totals
- **And** summarizes it conversationally

- **Given** the user says "Checkout"
- **When** the agent has cart items
- **Then** it calls `get_user_addresses(user_id)` to find shipping address
- **And** if missing, asks the user to provide one
- **And** only calls `initiate_checkout` after explicit confirmation

#### Technical Notes
- Tools are thin wrappers around service layer functions
- Service layer (P2) provides: `ProductService.search_products()`, `OrderService.add_to_cart()`, etc.
- Agent imports services; services NEVER import agent (unidirectional)
- Add Pydantic models for tool inputs/outputs
- Log all tool calls for debugging and analytics
- Handle tool errors gracefully (e.g., product not found → agent says so politely)

#### Dependencies
- S2-P1-002 (agent state machine)
- S1-P2-005 (cart service)

#### Assigned To
- Person 1 (AI/ML Lead) + Person 2 (Backend Lead) — P1 defines tool interfaces, P2 implements service functions

#### Estimation
- 10 hours (collaborative)

---

### S2-P1-004: Conversation Persistence & Context Memory

**As a** shopper  
**I want** the agent to remember our conversation and my preferences  
**So that** follow-up questions feel natural

#### Acceptance Criteria
- **Given** I chatted with the agent yesterday
- **When** I return today and say "Do you have those shoes in blue?"
- **Then** the agent remembers "those shoes" from the previous session
- **And** searches for the same product in blue

- **Given** I mention "I'm on a budget" in one message
- **When** I later ask for recommendations
- **Then** the agent filters by lower price ranges without me asking again

- **Given** a conversation is active
- **When** the agent uses tools or makes decisions
- **Then** the full message history is saved to the database
- **And** includes tool calls and tool results (not just surface text)

#### Technical Notes
- `conversations` table stores:
  - `messages`: array of `{role, content, timestamp, tool_calls, tool_results}`
  - `context_state`: JSONB with working memory:
    ```json
    {
      "budget_hint": 100,
      "preferred_categories": ["electronics"],
      "current_cart_snapshot": [...],
      "last_discussed_products": ["uuid1", "uuid2"]
    }
    ```
- Load last N messages (e.g., 20) into agent context on each turn
- Summarize older conversations if they exceed token limits
- Context state is updated by the agent after each turn
- Session ID ties together a single shopping session

#### Dependencies
- S0-P2-001 (conversation table exists)

#### Assigned To
- Person 1 (AI/ML Lead)

#### Estimation
- 8 hours

---

### S2-P3-001: Streaming Chat Interface

**As a** shopper  
**I want** to chat with the AI in real-time with typing indicators and streaming responses  
**So that** the experience feels like talking to a human assistant

#### Acceptance Criteria
- **Given** I am on the chat page (`/chat`)
- **When** I type a message and press Enter
- **Then** my message appears immediately in the chat window
- **And** a typing indicator shows the agent is "thinking"
- **And** the agent's response streams in word-by-word
- **And** product cards render inline within the chat

- **Given** the agent recommends products
- **When** they appear in the response
- **Then** I see rich product cards with image, title, price, and "Add to Cart" button
- **And** clicking "Add to Cart" immediately updates my cart

- **Given** I want to refer to a previous product
- **When** I click on a product card in chat history
- **Then** the product detail modal opens

#### Technical Notes
- Use Vercel AI SDK (`useChat` hook) for streaming
- Backend must support Server-Sent Events (SSE) or WebSockets for streaming
- Chat layout: sidebar with conversation history, main area for current chat
- Message bubble styling: user on right, agent on left
- Product cards: horizontal card with image left, details right, action buttons
- Scroll to bottom on new messages
- Mobile: full-screen chat with collapsible sidebar

#### Dependencies
- S2-P1-003 (agent tools working)
- S1-P3-005 (cart UI exists)

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 12 hours

---

### S2-P3-002: Product Cards in Chat

**As a** shopper  
**I want** to see rich product cards directly in the chat  
**So that** I can view and add products without leaving the conversation

#### Acceptance Criteria
- **Given** the agent recommends products
- **When** they are rendered in the chat
- **Then** each product shows:
  - Thumbnail image
  - Title and brand
  - Price
  - Rating (placeholder if not available)
  - "Add to Cart" button
  - "View Details" link

- **Given** a product has variants
- **When** I click "Add to Cart"
- **Then** a variant selector appears (if multiple variants exist)
- **And** I must select a variant before adding

- **Given** a product is out of stock
- **When** it appears in chat
- **Then** the card shows "Out of Stock" badge
- **And** the "Add to Cart" button is disabled
- **And** the agent offers alternatives

#### Technical Notes
- Create `ChatProductCard` component
- Accept product data in the chat response format:
  ```json
  {
    "role": "assistant",
    "content": "Here are some great running shoes...",
    "products": [{"id": "uuid", "title": "...", "price": 89.99, "image": "..."}]
  }
  ```
- Use the same product card design as the catalog browser for consistency
- Inline variant selector: small dropdown or radio buttons
- Toast notification on successful add-to-cart

#### Dependencies
- S2-P3-001 (chat interface)

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 6 hours

---

### S2-P2-001: Streaming Chat API Endpoint

**As a** backend developer  
**I want** a chat endpoint that streams agent responses  
**So that** the frontend can show real-time typing

#### Acceptance Criteria
- **Given** a logged-in user sends a POST to `/api/v1/chat`
- **When** the request body is `{message: "Find me running shoes", session_id: "abc123"}`
- **Then** the response is streamed as Server-Sent Events (SSE)
- **And** each SSE event contains a chunk of the agent's response
- **And** product recommendations are embedded as JSON in the stream
- **And** the stream ends with a `[DONE]` marker

- **Given** a user sends a message without a session_id
- **When** the backend receives it
- **Then** a new session_id is generated
- **And** returned in the response headers

#### Technical Notes
- FastAPI supports SSE via `StreamingResponse` with `media_type="text/event-stream"`
- Agent response generator yields chunks:
  ```python
  async def generate_response(user_id, message, session_id):
      state = await load_conversation(user_id, session_id)
      result = await shopping_agent.ainvoke(state)
      # Yield text chunks
      for chunk in result["response"]:
          yield f"data: {json.dumps({'type': 'text', 'content': chunk})}\n\n"
      # Yield product recommendations
      yield f"data: {json.dumps({'type': 'products', 'items': result['retrieved_products']})}\n\n"
      yield "data: [DONE]\n\n"
  ```
- Save the full conversation to DB after the stream completes (or in background)
- Handle errors: if agent fails mid-stream, send an error event and close

#### Dependencies
- S2-P1-003 (agent tools)
- S2-P1-004 (conversation persistence)

#### Assigned To
- Person 2 (Backend Lead) — API layer
- Person 1 (AI/ML Lead) — agent integration

#### Estimation
- 8 hours (collaborative)

---

### S2-P2-002: Checkout API with Stripe Integration

**As a** shopper  
**I want** to complete my purchase securely through Stripe  
**So that** my payment is processed safely

#### Acceptance Criteria
- **Given** I have items in my cart and a saved address
- **When** I confirm checkout
- **Then** the backend creates an order with status "pending"
- **And** inventory is temporarily reserved (held)
- **And** a Stripe PaymentIntent is created
- **And** the client secret is returned to the frontend

- **Given** Stripe confirms payment
- **When** the frontend calls `/api/v1/orders/{id}/confirm` with payment intent ID
- **Then** the order status changes to "paid"
- **And** inventory is permanently deducted
- **And** an inventory transaction is logged
- **And** a success response is returned

- **Given** payment fails
- **When** Stripe returns failure
- **Then** the order status changes to "cancelled"
- **And** held inventory is released
- **And** the user sees an error message

#### Technical Notes
- Stripe flow:
  1. `POST /api/v1/orders` → create order draft, hold inventory, create PaymentIntent
  2. Frontend uses Stripe.js to confirm payment with client_secret
  3. `POST /api/v1/orders/{id}/confirm` → verify payment with Stripe API, finalize order
- Inventory holding: reduce `inventory_count` by order quantity, set `held_until` timestamp
- If payment not confirmed within 30 minutes, release held inventory (Celery scheduled task)
- Stripe webhook endpoint: `/api/v1/webhooks/stripe` for async payment confirmations
- Webhook signature verification mandatory

#### Dependencies
- S1-P2-005 (cart service)
- S1-P2-006 (address management)

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 10 hours

---

### S2-P3-003: Conversational Checkout UI

**As a** shopper  
**I want** to complete checkout through the chat interface  
**So that** I don't need to navigate to a separate checkout page

#### Acceptance Criteria
- **Given** I say "I'm ready to checkout"
- **When** the agent confirms my cart
- **Then** it shows an order summary in chat:
  - Item list with quantities and prices
  - Subtotal, tax, shipping, total
  - Selected shipping address
  - Selected payment method

- **Given** the agent shows the order summary
- **When** I confirm "Yes, place the order"
- **Then** the payment is processed
- **And** a confirmation message appears with order number
- **And** a "Track Order" button is shown

- **Given** I don't have a saved address
- **When** I try to checkout
- **Then** the agent asks for my shipping address
- **And** provides a form to input it
- **And** offers to save it for future orders

#### Technical Notes
- Order summary component: styled card in chat, read-only
- Address form: inline in chat or modal
- Payment: Stripe Elements embedded in a modal or inline
- Confirmation: animated success state, confetti optional
- Error handling: inline error messages in chat if payment fails
- Link to order details page after confirmation

#### Dependencies
- S2-P3-001 (chat interface)
- S2-P2-002 (checkout API)

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 10 hours

---

### S2-P2-003: Inventory Management & Transaction Logging

**As a** system  
**I want** every inventory change to be logged  
**So that** we can audit stock movements and support forecasting

#### Acceptance Criteria
- **Given** a product is sold
- **When** the order is confirmed
- **Then** an `inventory_transaction` row is created with:
  - `transaction_type: "sale"`
  - `quantity_change: -N`
  - `running_balance: current_stock`
  - `order_id: the_order_uuid`

- **Given** a vendor restocks a product
- **When** they update the inventory count
- **Then** an `inventory_transaction` row is created with:
  - `transaction_type: "restock"`
  - `quantity_change: +N`
  - `running_balance: new_stock`

- **Given** an order is cancelled
- **When** inventory is released
- **Then** a transaction is logged with `transaction_type: "return"`

#### Technical Notes
- Create `inventory_transactions` table (see schema in Sprint 0)
- Trigger transaction logging from:
  - Order confirmation (sale)
  - Product update via vendor dashboard (restock)
  - Order cancellation (return/adjustment)
- Use database triggers OR explicit service layer calls (prefer explicit for audit clarity)
- Expose `/api/v1/vendors/inventory-history` for vendor's own products
- Aggregate daily inventory snapshots for forecasting input

#### Dependencies
- S1-P2-003 (product CRUD)

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 6 hours

---

### S2-P5-001: Image Upload in Chat

**As a** shopper  
**I want** to upload an image in chat and ask for similar products  
**So that** I can shop visually

#### Acceptance Criteria
- **Given** I am in the chat interface
- **When** I click an attachment/image icon and upload a photo
- **Then** the image appears in the chat as my message
- **And** the agent receives the image
- **And** the agent uses image search (SigLIP embedding) to find similar products
- **And** results are shown in the chat

#### Technical Notes
- Frontend: support drag-and-drop and file picker in chat input
- Compress image before upload (max 2MB for chat)
- Backend: save uploaded image temporarily, generate SigLIP embedding, search Qdrant image vectors
- Clean up temp files after processing
- Support image + text combined queries
- Show loading state while image is being processed

#### Dependencies
- S2-P1-001 (hybrid RAG)
- S1-P5-001 (image upload pipeline)

#### Assigned To
- Person 5 (DevOps) + Person 1 (AI/ML)

#### Estimation
- 8 hours (collaborative)

---

### S2-P3-004: Order History & Tracking Pages

**As a** shopper  
**I want** to view my past orders and track their status  
**So that** I can see my purchase history

#### Acceptance Criteria
- **Given** I am logged in
- **When** I visit `/orders`
- **Then** I see a list of my orders with:
  - Order number
  - Date
  - Total amount
  - Status (paid, shipped, delivered)
  - Thumbnail of first item

- **Given** I click an order
- **When** I view `/orders/{id}`
- **Then** I see full order details:
  - All items with images and prices
  - Shipping address
  - Payment method (masked)
  - Status timeline (ordered → paid → shipped → delivered)

#### Technical Notes
- Use TanStack Query for data fetching
- Order list: table on desktop, cards on mobile
- Status timeline: vertical stepper component
- Show estimated delivery date if available
- Allow reordering ("Buy again" button)

#### Dependencies
- S2-P2-002 (order creation)

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 6 hours

---

### S2-P2-004: Order Management API for Vendors

**As a** vendor  
**I want** to see and manage orders for my products  
**So that** I can fulfill them

#### Acceptance Criteria
- **Given** I am a logged-in vendor
- **When** I GET `/api/v1/vendor/orders`
- **Then** I see only orders containing my products
- **And** I can filter by status (paid, shipped, delivered)
- **And** I can update the status of items I shipped

- **Given** an order contains products from multiple vendors
- **When** I view it
- **Then** I only see and can manage my own items
- **And** the full order status reflects all vendors' progress

#### Technical Notes
- Filter `order_items` by `vendor_id` for the authenticated vendor
- Vendor can update status only for their own items
- Full order status is computed from all items:
  - All paid → order: paid
  - Some shipped → order: partially shipped
  - All delivered → order: delivered
- Add endpoint: `PUT /api/v1/vendor/orders/{order_id}/items/{item_id}/status`

#### Dependencies
- S2-P2-002 (orders)

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 4 hours

---

## Sprint 2 Definition of Done

- [ ] User can chat naturally and get product recommendations
- [ ] Agent retrieves products using hybrid RAG (text + image)
- [ ] Agent can add/remove items from cart conversationally
- [ ] Cart state syncs between chat and cart UI
- [ ] User can checkout through chat with Stripe payment
- [ ] Order is created, inventory deducted, transaction logged
- [ ] Vendor can view and manage their orders
- [ ] Conversation history persists across sessions
- [ ] Image upload in chat works for visual search
- [ ] Streaming chat UI is responsive and smooth

## Sprint 2 Demo

Show the conversational shopping experience:
1. User opens chat → "I need running shoes for marathons under $100"
2. Agent shows 3 product cards in chat
3. User: "Add the second one to my cart"
4. Agent confirms addition
5. User: "Show me my cart"
6. Agent displays cart summary
7. User: "Checkout"
8. Agent shows order summary, asks for confirmation
9. User: "Yes, place the order"
10. Payment processes, confirmation shown
11. User refreshes page → chat history and cart state preserved
12. Vendor sees the new order in their dashboard
