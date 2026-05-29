# Specification: Authentication & Authorization System

## Overview

The authentication system supports two distinct user types: **Shoppers** and **Vendors**. Both use JWT (JSON Web Token) for stateless authentication, but their tokens carry different role claims and grant access to different API resources.

## User Types

| Type | Table | Role Claim | Can Access |
|------|-------|------------|------------|
| Shopper | `users` | `"role": "user"` | Products, Cart, Orders, Chat, Addresses |
| Vendor | `vendors` | `"role": "vendor"` | Products (own), Orders (own items), Analytics, Dashboard |

## JWT Token Structure

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "role": "user",
  "exp": 1717020000,
  "iat": 1717018200
}
```

- `sub`: UUID of the user or vendor
- `role`: `"user"` or `"vendor"`
- `exp`: Expiration (30 minutes from issuance)
- `iat`: Issued at

## API Endpoints

### Registration

**User Registration**
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "shopper@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "role": "user"
}

Response 201:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "shopper@example.com",
  "name": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Vendor Registration**
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "vendor@example.com",
  "business_name": "Acme Store",
  "password": "securePassword123",
  "role": "vendor"
}

Response 201:
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "business_name": "Acme Store",
  "email": "vendor@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "shopper@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Current User

```
GET /api/v1/auth/me
Authorization: Bearer <token>

Response 200:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "shopper@example.com",
  "name": "John Doe",
  "role": "user"
}
```

## Password Security

- Hashing: `bcrypt` via `passlib[bcrypt]`
- Work factor: default (12 rounds)
- Minimum password length: 8 characters
- No password complexity rules (length is sufficient entropy)

## RBAC (Role-Based Access Control)

### FastAPI Dependencies

```python
# Require any authenticated user
async def get_current_user(...)

# Require shopper
async def require_user(current_user = Depends(get_current_user)):
    if current_user.role != "user":
        raise HTTPException(403, "User access required")
    return current_user

# Require vendor
async def require_vendor(current_user = Depends(get_current_user)):
    if current_user.role != "vendor":
        raise HTTPException(403, "Vendor access required")
    return current_user

# Require owner (vendor can only access their own resources)
async def require_owner(vendor_id: UUID, current_vendor = Depends(require_vendor)):
    if current_vendor.id != vendor_id:
        raise HTTPException(403, "Not authorized for this resource")
    return current_vendor
```

### Endpoint Protection

```python
# Public
@router.get("/products")  # No auth required

# User-only
@router.get("/cart", dependencies=[Depends(require_user)])
@router.post("/orders", dependencies=[Depends(require_user)])

# Vendor-only
@router.post("/products", dependencies=[Depends(require_vendor)])
@router.get("/vendor/analytics", dependencies=[Depends(require_vendor)])
```

## Token Storage (Frontend)

- Store in `localStorage` (not cookies — API is stateless JWT)
- Key: `token`
- Axios interceptor attaches `Authorization: Bearer <token>` to all requests
- On 401 response: remove token, redirect to login

## Security Considerations

1. **Token Refresh**: Not implemented in MVP. Tokens expire in 30 minutes. User must re-login.
2. **Token Revocation**: Not implemented in MVP. No blacklist.
3. **HTTPS**: Mandatory in production. Nginx terminates TLS.
4. **CORS**: Strict origin whitelist. Only `FRONTEND_URL` allowed.
5. **Rate Limiting**: Auth endpoints limited to 10 requests per minute per IP.

## Implementation Checklist

- [ ] `users` and `vendors` tables with UUID PK
- [ ] Bcrypt password hashing
- [ ] JWT encode/decode functions
- [ ] Register endpoint with email validation
- [ ] Login endpoint with credential verification
- [ ] `/auth/me` endpoint
- [ ] `get_current_user` dependency
- [ ] `require_user` and `require_vendor` dependencies
- [ ] Password length validation (min 8)
- [ ] Frontend auth context (Zustand or React Context)
- [ ] Axios interceptor for token attachment
- [ ] Logout functionality (clear localStorage)

## Testing Scenarios

1. Register user → verify token works for user endpoints → verify 403 for vendor endpoints
2. Register vendor → verify token works for vendor endpoints → verify 403 for user endpoints
3. Login with wrong password → 401
4. Access protected endpoint without token → 401
5. Access protected endpoint with expired token → 401
6. Register with invalid email → 422
7. Register with short password → 422
