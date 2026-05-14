# SMART JEWELLERY INVENTORY OS - API Documentation

## Base URL

```
https://your-app.vercel.app/api
```

## Authentication

All endpoints require authentication. Include JWT token in headers:

```
Authorization: Bearer <jwt-token>
```

JWT token is automatically obtained after login via Supabase Auth.

---

## Error Handling

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Inventory Endpoints

### List All Inventory

```
GET /inventory
```

**Query Parameters**

```
?page=1              - Page number (default: 1)
?limit=20            - Items per page (default: 20)
?search=gold         - Search by product name or category
?category=ring       - Filter by category
?status=in-stock     - Filter by status
?sort=created_at     - Sort field
?order=desc          - Sort order (asc/desc)
```

**Response (200)**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
    "product_name": "Gold Ring",
    "category": "Ring",
    "gross_weight": 5.2,
    "quantity": 10,
    "purchase_price": 15000,
    "selling_price": 20000,
    "vendor": "ABC Jewelry",
    "storage_location": "Shelf A1",
    "notes": "18K gold",
    "status": "In Stock",
    "created_by": "user-123",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z",
    "deleted_at": null
  }
]
```

---

### Create Inventory Item

```
POST /inventory
```

**Request Body**

```json
{
  "product_name": "Gold Ring",
  "category": "Ring",
  "gross_weight": 5.2,
  "quantity": 10,
  "purchase_price": 15000,
  "selling_price": 20000,
  "vendor": "ABC Jewelry",
  "storage_location": "Shelf A1",
  "notes": "18K gold",
  "status": "In Stock"
}
```

**Required Fields**: product_name, category, gross_weight, quantity, purchase_price, vendor, storage_location

**Response (201)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
  "product_name": "Gold Ring",
  ...
}
```

---

### Get Single Inventory Item

```
GET /inventory/:id
```

**Path Parameters**

```
:id - Inventory item UUID
```

**Response (200)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
  "product_name": "Gold Ring",
  ...
}
```

---

### Update Inventory Item

```
PUT /inventory/:id
```

**Path Parameters**

```
:id - Inventory item UUID
```

**Request Body** (same as POST, any fields can be updated)

```json
{
  "quantity": 8,
  "selling_price": 22000
}
```

**Response (200)**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 8,
  "selling_price": 22000,
  "updated_at": "2024-01-02T10:00:00Z"
}
```

---

### Delete Inventory Item (Soft Delete)

```
DELETE /inventory/:id
```

**Path Parameters**

```
:id - Inventory item UUID
```

**Response (200)**

```json
{
  "success": true,
  "message": "Item moved to trash"
}
```

---

## Audit Endpoints

### Compare Inventory

```
POST /audit/compare
```

**Request Body**

```json
{
  "items": [
    {
      "inventory_id": "550e8400-e29b-41d4-a716-446655440000",
      "physical_quantity": 8
    },
    {
      "inventory_id": "550e8400-e29b-41d4-a716-446655440001",
      "physical_quantity": 5
    }
  ],
  "audit_date": "2024-01-01T10:00:00Z",
  "notes": "Monthly audit"
}
```

**Response (200)**

```json
{
  "mismatches": [
    {
      "inventory_id": "550e8400-e29b-41d4-a716-446655440000",
      "product_name": "Gold Ring",
      "recorded_quantity": 10,
      "physical_quantity": 8,
      "difference": -2,
      "severity": "orange",
      "reason": "Recorded 10 items, but physical count shows 8"
    }
  ],
  "summary": {
    "total_items_checked": 2,
    "mismatches_found": 1,
    "critical_issues": 0
  }
}
```

---

### Approve Audit Changes

```
POST /audit/approve
```

**Request Body**

```json
{
  "audit_date": "2024-01-01T10:00:00Z",
  "mismatches": [
    {
      "inventory_id": "550e8400-e29b-41d4-a716-446655440000",
      "physical_quantity": 8
    }
  ]
}
```

**Response (200)**

```json
{
  "success": true,
  "message": "Audit completed",
  "updated_items": 1,
  "audit_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

---

### Get Audit History

```
GET /audit
```

**Query Parameters**

```
?page=1              - Page number (default: 1)
?limit=20            - Items per page (default: 20)
?severity=red        - Filter by severity (green, yellow, orange, red)
?start_date=2024-01-01  - Filter by date range
?end_date=2024-01-31
```

**Response (200)**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
    "inventory_reference": "550e8400-e29b-41d4-a716-446655440000",
    "mismatch_type": "quantity_mismatch",
    "severity": "orange",
    "notes": "Recorded 10 items, but physical count shows 8",
    "created_by": "user-123",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

---

## AI Endpoints

### Analyze Image

```
POST /ai/analyze
```

**Request Body**

```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...",
  "hint": "Ring"
}
```

**Response (200)**

```json
{
  "product_name": "Gold Ring",
  "category": "Ring",
  "confidence": 92,
  "material": "Gold",
  "purity_mark": "18K",
  "notes": "Professional jewelry photography",
  "suggestion_quality": "high"
}
```

---

## Rate Limiting

Rate limits per API key:

- **Free Plan**: 100 requests/hour
- **Pro Plan**: 1,000 requests/hour
- **Enterprise**: Unlimited

Response header includes remaining quota:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2024-01-01T11:00:00Z
```

---

## Pagination

List endpoints support pagination:

```
?page=1              - Page number (1-indexed)
?limit=20            - Items per page (1-100)
```

Response includes pagination info:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Webhooks (Future)

```
POST /webhooks/subscribe
```

Supported events:
- `inventory.created`
- `inventory.updated`
- `inventory.deleted`
- `audit.completed`
- `low_stock_alert`

---

## Code Examples

### Python

```python
import requests

API_URL = "https://your-app.vercel.app/api"
headers = {"Authorization": f"Bearer {jwt_token}"}

# Get inventory
response = requests.get(f"{API_URL}/inventory", headers=headers)
items = response.json()

# Create inventory
new_item = {
    "product_name": "Gold Ring",
    "category": "Ring",
    "gross_weight": 5.2,
    "quantity": 10,
    "purchase_price": 15000,
    "vendor": "ABC Jewelry",
    "storage_location": "Shelf A1"
}
response = requests.post(f"{API_URL}/inventory", json=new_item, headers=headers)
```

### JavaScript

```javascript
const API_URL = "https://your-app.vercel.app/api";
const headers = { Authorization: `Bearer ${jwtToken}` };

// Get inventory
const response = await fetch(`${API_URL}/inventory`, { headers });
const items = await response.json();

// Create inventory
const newItem = {
  product_name: "Gold Ring",
  category: "Ring",
  gross_weight: 5.2,
  quantity: 10,
  purchase_price: 15000,
  vendor: "ABC Jewelry",
  storage_location: "Shelf A1"
};
const response = await fetch(`${API_URL}/inventory`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify(newItem)
});
```

### cURL

```bash
# Get inventory
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://your-app.vercel.app/api/inventory

# Create inventory
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name":"Gold Ring",
    "category":"Ring",
    "gross_weight":5.2,
    "quantity":10,
    "purchase_price":15000,
    "vendor":"ABC Jewelry",
    "storage_location":"Shelf A1"
  }' \
  https://your-app.vercel.app/api/inventory
```

---

## Versioning

Current API version: `v1`

Future versions will be available at:
- `/api/v1/inventory`
- `/api/v2/inventory` (when released)

---

## Support

For API issues or questions:
- Documentation: See ARCHITECTURE.md
- Examples: See code examples above
- Issues: GitHub Issues