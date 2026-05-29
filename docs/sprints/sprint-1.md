# Sprint 1: Core Commerce

**Duration:** Weeks 2-4  
**Goal:** A vendor can create an account, upload products with images, and manage their catalog. A user can browse products, create an account, and view product details. Authentication works for both roles.

## Sprint 1 Overview

This sprint builds the foundational commerce layer. Without these features, no shopping can happen. The focus is on:
1. Authentication (users and vendors)
2. Product catalog (upload, browse, detail view)
3. Cart persistence (database-backed)
4. Basic vendor dashboard shell

---

## Stories

### S1-P2-001: User Registration & Login

**As a** shopper  
**I want** to create an account and log in with email and password  
**So that** I can save my cart and order history

#### Acceptance Criteria
- **Given** I am on the registration page
- **When** I submit email, name, and password
- **Then** an account is created with a UUID
- **And** the password is hashed with bcrypt
- **And** a JWT access token is returned
- **And** I can use this token to access protected endpoints

- **Given** I have an account
- **When** I log in with correct credentials
- **Then** I receive a JWT token valid for 30 minutes
- **And** the token contains my user_id as `sub`

#### Technical Notes
- `POST /api/v1/auth/register` — body: `{email, name, password}`
- `POST /api/v1/auth/login` — body: `{email, password}`
- `GET /api/v1/auth/me` — returns current user profile
- Use `passlib[bcrypt]` for hashing
- Use `python-jose[cryptography]` for JWT
- Pydantic models: `UserCreate`, `UserLogin`, `UserResponse`
- Validate email format with `email-validator`

#### Dependencies
- S0-P2-001 (database schema)
- S0-P2-002 (async sessions)

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 6 hours

---

### S1-P2-002: Vendor Registration & Login

**As a** vendor  
**I want** to create a vendor account separate from user accounts  
**So that** I can manage my store and products

#### Acceptance Criteria
- **Given** I am on the vendor registration page
- **When** I submit business name, email, and password
- **Then** a vendor account is created
- **And** the vendor gets a dashboard config object (empty JSON)
- **And** onboarding_complete is false by default

- **Given** I am a logged-in vendor
- **When** I access vendor-only endpoints
- **Then** my vendor_id is available in the request context
- **And** I cannot access user-specific endpoints (cart, orders)

#### Technical Notes
- Separate table: `vendors` (not a role on `users`)
- Same JWT mechanism but token type indicates `vendor`
- Add `role` claim to JWT payload: `"role": "user"` or `"role": "vendor"`
- Create RBAC dependency: `require_vendor()`, `require_user()`

#### Dependencies
- S1-P2-001

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 4 hours

---

### S1-P2-003: Product CRUD API

**As a** vendor  
**I want** to create, read, update, and delete my products via API  
**So that** I can manage my catalog

#### Acceptance Criteria
- **Given** I am an authenticated vendor
- **When** I POST to `/api/v1/products` with title, price, description, images
- **Then** a product is created with my vendor_id
- **And** images are uploaded to storage (local for dev, S3 for prod)
- **And** the product status is "draft" by default

- **Given** I have products
- **When** I GET `/api/v1/products` with my vendor token
- **Then** I see only my products
- **And** I can filter by status (active, draft, archived)

- **Given** I own a product
- **When** I PUT `/api/v1/products/{id}` with updated fields
- **Then** the product is updated
- **And** if title/description changed, an embedding regeneration job is queued

- **Given** I own a product
- **When** I DELETE `/api/v1/products/{id}`
- **Then** the product is soft-deleted (status = archived)
- **And** it no longer appears in search results

#### Technical Notes
- Use SQLAlchemy relationships for variants
- Image upload: accept multipart/form-data, validate type (jpg, png, webp), max 5MB
- Store image metadata in `products.images` JSONB array
- Use `UUID` from `sqlalchemy.dialects.postgresql`
- On create/update, queue Celery task `generate_product_embeddings.delay(product_id)`
- Add `vendor_id` filter to all product list queries

#### Dependencies
- S1-P2-002 (vendor auth)
- S0-P5-004 (Celery worker)

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 8 hours

---

### S1-P2-004: Product Browse & Search API

**As a** shopper  
**I want** to browse and filter products in the marketplace  
**So that** I can find what I'm looking for

#### Acceptance Criteria
- **Given** I visit the marketplace
- **When** I GET `/api/v1/products` (public endpoint, no auth required)
- **Then** I see active products from all vendors
- **And** I can paginate with `?page=1&limit=20`

- **Given** I want to filter products
- **When** I add query params: `?category=electronics&min_price=10&max_price=100&search=headphones`
- **Then** only matching products are returned
- **And** search matches title, description, and tags (ILIKE for now; RAG in Sprint 2)

- **Given** I click a product
- **When** I GET `/api/v1/products/{id}`
- **Then** I see full product details including variants and vendor info
- **And** inventory count is shown (but don't expose exact stock if low — say "Low stock" or "In stock")

#### Technical Notes
- Full-text search with PostgreSQL `tsvector` or simple ILIKE for Sprint 1
- Add composite index on `(status, category, price)`
- Response model: `ProductResponse` with nested `VendorInfo` (just business_name, not sensitive data)
- Eager load variants to avoid N+1
- Cache popular product lists in Redis (5-minute TTL)

#### Dependencies
- S1-P2-003

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 6 hours

---

### S1-P3-001: Authentication Pages

**As a** user or vendor  
**I want** to register and log in through the web interface  
**So that** I can access my account

#### Acceptance Criteria
- **Given** I am on the homepage
- **When** I click "Sign In"
- **Then** I see a login form with email and password
- **And** on success, a JWT token is stored in localStorage
- **And** I am redirected to the appropriate dashboard (user → home, vendor → vendor dashboard)

- **Given** I am on the login page
- **When** I click "Create Account"
- **Then** I can choose "Shopper" or "Vendor" account type
- **And** the registration form adapts to the selected type

- **Given** I am logged in
- **When** I refresh the page
- **Then** I remain logged in (token persists in localStorage)
- **And** the UI shows my name in the navigation

#### Technical Notes
- Create pages: `/login`, `/register`, `/vendor/login`, `/vendor/register`
- Use React Context or Zustand for auth state
- Store token in localStorage (not cookies — API uses JWT Bearer)
- Add `Axios interceptor` to attach `Authorization: Bearer <token>` header
- Show loading states and validation errors
- Password field: minimum 8 characters, show/hide toggle

#### Dependencies
- S1-P2-001
- S1-P2-002

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 8 hours

---

### S1-P3-002: Product Catalog Browser

**As a** shopper  
**I want** to browse products in a grid layout with filtering  
**So that** I can discover items to buy

#### Acceptance Criteria
- **Given** I visit `/browse`
- **When** the page loads
- **Then** I see a grid of product cards with image, title, price, and vendor name
- **And** I can scroll to load more (infinite scroll or pagination)

- **Given** I want to filter products
- **When** I select a category from the sidebar
- **Then** the grid updates to show only that category
- **And** the URL updates with `?category=electronics`

- **Given** I want to search
- **When** I type in the search bar and press Enter
- **Then** the grid updates with matching products
- **And** the search term is shown as a chip that can be cleared

#### Technical Notes
- Use React Server Components for initial product load (SEO)
- Use TanStack Query (`useInfiniteQuery`) for pagination
- Product card component: image (lazy loaded), title, price, vendor name, rating placeholder
- Filters: category (from API), price range slider, sort (price, newest)
- Responsive: 1 column mobile, 2 tablet, 4 desktop
- Loading skeletons while data fetches

#### Dependencies
- S1-P2-004

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 10 hours

---

### S1-P3-003: Product Detail Page

**As a** shopper  
**I want** to view detailed product information with images and variants  
**So that** I can decide whether to buy

#### Acceptance Criteria
- **Given** I click a product card
- **When** I land on `/products/{id}`
- **Then** I see:
  - Image gallery (main image + thumbnails)
  - Title, price, compare-at price (if on sale)
  - Full description
  - Vendor name and link to their store
  - Variant selector (size, color dropdowns)
  - "Add to Cart" button
  - Inventory status ("In stock", "Low stock", "Out of stock")

- **Given** a product has variants
- **When** I select a different variant
- **Then** the price updates if there's a price adjustment
- **And** the inventory status updates

#### Technical Notes
- Use Next.js dynamic route: `app/products/[id]/page.tsx`
- Image gallery: react-image-gallery or custom implementation
- Variant selection: use React state, fetch variant details from product API
- Disabled "Add to Cart" if out of stock
- Show vendor info but don't expose internal IDs
- Related products placeholder (will be AI recommendations in Sprint 2)

#### Dependencies
- S1-P2-004

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 8 hours

---

### S1-P3-004: Vendor Product Upload Form

**As a** vendor  
**I want** to upload products with images through a form  
**So that** my products appear in the marketplace

#### Acceptance Criteria
- **Given** I am on the vendor dashboard
- **When** I navigate to "Add Product"
- **Then** I see a form with:
  - Title (required)
  - Description (rich text or markdown)
  - Price (required)
  - Compare-at price (optional, for sales)
  - Category dropdown (fetched from backend)
  - Tags input (comma-separated, chips)
  - Brand input
  - SKU input
  - Images (drag-and-drop, multiple, preview thumbnails)
  - Variants (dynamic add/remove: name, SKU, price adjustment, inventory, attributes)

- **Given** I fill the form correctly
- **When** I submit
- **Then** the product is created
- **And** images start uploading with progress bars
- **And** I see a success toast and am redirected to product list

- **Given** I upload invalid images
- **When** I drop a PDF or oversized file
- **Then** I see validation errors before submission
- **And** invalid files are rejected

#### Technical Notes
- Use `react-dropzone` for drag-and-drop
- Client-side validation: image type (jpg/png/webp), max 5MB per image, max 8 images
- Show upload progress (simulated or real if S3 multipart)
- Dynamic variants: add row button, each row has inputs
- Use `FormData` for multipart submission
- On success, invalidate product list cache in TanStack Query

#### Dependencies
- S1-P2-003

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 10 hours

---

### S1-P5-001: Image Upload Pipeline

**As a** vendor  
**I want** product images to be stored securely and served quickly  
**So that** shoppers see high-quality product photos

#### Acceptance Criteria
- **Given** I upload an image through the product form
- **When** the backend receives the multipart request
- **Then** the image is validated (format, size, dimensions)
- **And** in development, it's saved to a local directory
- **And** in production, it's uploaded to S3/R2 with a UUID filename
- **And** the image URL is stored in `products.images`

- **Given** an image is stored
- **When** a shopper views the product
- **Then** the image loads via CDN-friendly URL
- **And** a thumbnail version is available (optional)

#### Technical Notes
- Backend: FastAPI `UploadFile`, validate with Pillow (open image, check format)
- Dev storage: `apps/backend/uploads/` served statically at `/uploads/`
- Prod storage: boto3 or r2 boto3-compatible client
- Generate UUID filename: `{uuid}.{ext}` to avoid collisions
- Store original + thumbnail (max 800px width)
- Clean up files if product creation fails (transaction rollback)

#### Dependencies
- S1-P2-003

#### Assigned To
- Person 5 (DevOps)

#### Estimation
- 6 hours

---

### S1-P5-002: Background Embedding Generation Job

**As a** system  
**I want** product embeddings to be generated asynchronously when a product is created or updated  
**So that** the API response is fast and the vector database stays synchronized

#### Acceptance Criteria
- **Given** a vendor creates or updates a product
- **When** the product is saved to the database
- **Then** a Celery task is enqueued
- **And** the worker generates text embedding (BGE-M3) from title + description + tags
- **And** if images exist, image embeddings (SigLIP) are generated
- **And** the vectors are upserted into Qdrant
- **And** the product's `text_embedding` and `image_embedding` columns are updated

- **Given** the embedding job fails
- **When** an exception occurs
- **Then** the task retries up to 3 times with exponential backoff
- **And** failures are logged

#### Technical Notes
- Celery task: `src/worker/tasks.py::generate_product_embeddings(product_id)`
- Fetch product from DB, generate embeddings, upsert to Qdrant, update DB
- Use `AsyncQdrantClient` for Qdrant operations
- Handle case where product was deleted before job runs (idempotency)
- Add task status tracking (optional: store in Redis or DB)

#### Dependencies
- S0-P1-002 (embedding models working)
- S0-P5-004 (Celery worker)
- S1-P2-003 (product CRUD)

#### Assigned To
- Person 5 (DevOps) + Person 1 (AI/ML) — P5 implements the Celery plumbing, P1 provides the embedding generation function

#### Estimation
- 6 hours (collaborative)

---

### S1-P2-005: Cart Service

**As a** shopper  
**I want** to add products to my cart and have them persist  
**So that** I can continue shopping across sessions

#### Acceptance Criteria
- **Given** I am logged in
- **When** I POST to `/api/v1/cart/items` with `{product_id, quantity, variant_id}`
- **Then** the item is added to my cart
- **And** if the product is already in the cart, quantity is incremented
- **And** inventory is checked (don't allow adding more than available)

- **Given** I have items in my cart
- **When** I GET `/api/v1/cart`
- **Then** I see all items with product details, prices, and totals
- **And** the response includes: subtotal, estimated tax, estimated shipping

- **Given** I have items in my cart
- **When** I DELETE `/api/v1/cart/items/{id}`
- **Then** the item is removed
- **And** the cart total is recalculated

#### Technical Notes
- Cart is database-backed (`cart_items` table), not session-based
- On add: validate product exists, is active, has sufficient inventory
- Include product details in response (eager load)
- Cart total calculation: sum of (product.price + variant.price_adjustment) * quantity
- Add `added_by_agent` boolean field (for tracking AI vs manual additions)

#### Dependencies
- S1-P2-001 (user auth)
- S1-P2-004 (product details)

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 6 hours

---

### S1-P3-005: Shopping Cart UI

**As a** shopper  
**I want** to view my cart with item details and totals  
**So that** I can review before checkout

#### Acceptance Criteria
- **Given** I have items in my cart
- **When** I click the cart icon
- **Then** a slide-out drawer or dedicated `/cart` page shows:
  - Product image, title, variant info
  - Price per item
  - Quantity selector (dropdown or +/- buttons)
  - Remove button
  - Subtotal, tax estimate, shipping estimate, total

- **Given** I change quantity in the cart
- **When** I select a new quantity
- **Then** the backend is updated
- **And** the total recalculates
- **And** if quantity exceeds inventory, I see an error

- **Given** my cart is empty
- **When** I view the cart
- **Then** I see an empty state with a "Continue Shopping" button

#### Technical Notes
- Use Zustand or TanStack Query for cart state management
- Optimistic updates for quantity changes (update UI first, sync with API)
- Cart icon in navigation shows item count badge
- Responsive: full-width cards on mobile, table-like on desktop
- Loading skeletons for cart data

#### Dependencies
- S1-P2-005 (cart API)

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 8 hours

---

### S1-P2-006: Address Management API

**As a** shopper  
**I want** to save multiple shipping addresses  
**So that** I don't need to type them at every checkout

#### Acceptance Criteria
- **Given** I am logged in
- **When** I POST to `/api/v1/users/addresses` with address details
- **Then** the address is saved to my user profile
- **And** I can set a default address

- **Given** I have saved addresses
- **When** I GET `/api/v1/users/addresses`
- **Then** I see all my addresses
- **And** I can update or delete any of them

#### Technical Notes
- Store addresses in `users` table as JSONB array, or separate `user_addresses` table
- Address fields: name, street, city, state, zip, country, phone
- Validation: required fields, zip code format per country
- One address can be marked as `is_default`
- Limit: 10 addresses per user

#### Dependencies
- S1-P2-001

#### Assigned To
- Person 2 (Backend Lead)

#### Estimation
- 4 hours

---

### S1-P3-006: Vendor Dashboard Shell

**As a** vendor  
**I want** a dedicated dashboard with navigation  
**So that** I can manage my store

#### Acceptance Criteria
- **Given** I am logged in as a vendor
- **When** I visit `/vendor`
- **Then** I see a dashboard layout with:
  - Sidebar navigation: Dashboard, Products, Orders, Analytics, Settings
  - Top bar with vendor name and logout
  - Main content area for the selected section

- **Given** I am not logged in
- **When** I try to access `/vendor`
- **Then** I am redirected to `/vendor/login`

- **Given** I am logged in as a user (not vendor)
- **When** I try to access `/vendor`
- **Then** I see a 403 error or redirect to user home

#### Technical Notes
- Create route group: `app/vendor/` with layout
- Layout component: sidebar + header + main content
- Protected route: check vendor token before rendering
- Active nav item highlighting
- Collapsible sidebar on mobile
- Use shadcn/ui Sheet for mobile sidebar

#### Dependencies
- S1-P3-001 (auth pages)
- S1-P2-002 (vendor auth)

#### Assigned To
- Person 3 (Frontend Lead)

#### Estimation
- 6 hours

---

### S1-P5-003: Seed Data Script

**As a** developer  
**I want** realistic test data in my local database  
**So that** I can test features without manually creating data

#### Acceptance Criteria
- **Given** a fresh database
- **When** I run `poetry run python scripts/seed.py`
- **Then** the database is populated with:
  - 5 vendors with stores
  - 50 products across categories (electronics, apparel, home, food, beauty)
  - 200 product variants
  - 10 users
  - Sample orders and cart items
  - Sample external signals for forecasting

- **Given** seeded data exists
- **When** the frontend loads
- **Then** the catalog browser shows realistic products with images

#### Technical Notes
- Use Faker library for realistic data generation
- Include real product image URLs from placeholder services or local files
- Ensure variants have proper inventory counts
- Generate diverse categories and tags for testing search/filters
- Idempotent: script should clear existing data first or use `--reset` flag
- Document how to run in README

#### Dependencies
- S1-P2-001 (schema)
- S1-P5-001 (image upload)

#### Assigned To
- Person 5 (DevOps)

#### Estimation
- 4 hours

---

## Sprint 1 Definition of Done

- [ ] User and vendor can register and log in
- [ ] Vendor can upload products with images
- [ ] Shopper can browse products with filters
- [ ] Shopper can view product details with variants
- [ ] Cart persists in database and shows in UI
- [ ] Vendor dashboard shell exists with navigation
- [ ] Background embedding jobs queue and process
- [ ] Seed data script populates realistic test data
- [ ] All APIs have Pydantic response models
- [ ] Frontend uses shared types for all API contracts

## Sprint 1 Demo

Show the end-to-end commerce flow:
1. Vendor registers → logs in → uploads a product with images
2. Shopper visits site → browses products → filters by category
3. Shopper clicks product → sees details and variants
4. Shopper adds to cart → views cart with correct totals
5. Backend shows embedding job completed for the new product
6. Cart persists after page refresh
