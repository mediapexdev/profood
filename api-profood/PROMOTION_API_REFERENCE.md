# Promotion System - API Reference

Quick reference guide for all promotion-related API endpoints.

---

## Public Endpoints

### Validate Promo Code

Validate a promotional code before placing an order.

**Endpoint:** `POST /api/validate-promo-code`
**Authentication:** None (public)

**Request Body:**
```json
{
  "code": "SUMMER2026",
  "order_amount": 10000,
  "delivery_fee": 500
}
```

**Success Response (200):**
```json
{
  "valid": true,
  "promotion": {
    "id": 1,
    "code": "SUMMER2026",
    "name": "Summer 2026 Promotion",
    "description": "10% off all orders",
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_description": "10% de réduction (maximum 2 000 CFA)",
    "minimum_order_amount": 5000,
    "discount_amount": 1000
  },
  "discount_amount": 1000,
  "message": "Code promotionnel valide! Vous économisez 1 000 CFA."
}
```

**Invalid Code Response (200):**
```json
{
  "valid": false,
  "error": "Code promotionnel invalide."
}
```

**Possible Error Messages:**
- "Code promotionnel invalide."
- "Ce code promotionnel n'est plus valide ou a atteint sa limite d'utilisation."
- "Vous ne pouvez pas utiliser ce code promotionnel."
- "Ce code est réservé aux nouvelles commandes uniquement."
- "Vous avez déjà utilisé ce code promotionnel le nombre maximum de fois autorisé."
- "Montant minimum de commande non atteint. Minimum requis: X CFA."

---

## Admin/Manager Endpoints

All endpoints below require authentication and Admin/Manager role.

### List All Promotions

Get a paginated list of all promotions.

**Endpoint:** `GET /api/promotions`
**Authentication:** Required (Admin/Manager)

**Query Parameters:**
- `per_page` (optional, default: 15) - Number of items per page
- `page` (optional, default: 1) - Page number

**Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "code": "SUMMER2026",
      "name": "Summer 2026 Promotion",
      "description": "10% off all orders",
      "discount_type": "percentage",
      "discount_value": 10,
      "minimum_order_amount": 5000,
      "maximum_discount": 2000,
      "usage_limit_total": 100,
      "usage_limit_per_user": 1,
      "usage_count": 15,
      "starts_at": "2026-06-01T00:00:00.000000Z",
      "expires_at": "2026-08-31T23:59:59.000000Z",
      "is_active": true,
      "first_order_only": false,
      "applicable_to": null,
      "created_at": "2026-02-08T20:00:00.000000Z",
      "updated_at": "2026-02-08T20:00:00.000000Z"
    }
  ],
  "per_page": 15,
  "total": 25
}
```

---

### Create Promotion

Create a new promotional code.

**Endpoint:** `POST /api/promotions`
**Authentication:** Required (Admin/Manager)

**Request Body:**
```json
{
  "code": "WELCOME10",
  "name": "Welcome New Customer",
  "description": "10% discount for first-time customers",
  "discount_type": "percentage",
  "discount_value": 10,
  "minimum_order_amount": 0,
  "maximum_discount": 5000,
  "usage_limit_total": null,
  "usage_limit_per_user": 1,
  "starts_at": "2026-01-01 00:00:00",
  "expires_at": "2026-12-31 23:59:59",
  "is_active": true,
  "first_order_only": true
}
```

**Field Details:**

- `code` (required, string, max:50): Unique promo code (uppercase letters, numbers, hyphens, underscores only)
- `name` (required, string, max:255): Display name
- `description` (optional, string, max:1000): Detailed description
- `discount_type` (required, enum): One of: `percentage`, `fixed_amount`, `free_delivery`
- `discount_value` (required, numeric, min:0): Discount value (0-100 for percentage, CFA amount for fixed_amount)
- `minimum_order_amount` (optional, numeric, min:0, default:0): Minimum order amount in CFA
- `maximum_discount` (optional, numeric, min:0): Maximum discount cap in CFA (useful for percentages)
- `usage_limit_total` (optional, integer, min:1): Total usage limit across all users (null = unlimited)
- `usage_limit_per_user` (optional, integer, min:1, default:1): Usage limit per user
- `starts_at` (optional, datetime): When promotion becomes active
- `expires_at` (optional, datetime): When promotion expires
- `is_active` (optional, boolean, default:true): Active status
- `first_order_only` (optional, boolean, default:false): Restrict to first orders only

**Success Response (201):**
```json
{
  "message": "Promotion créée avec succès.",
  "promotion": {
    "id": 2,
    "code": "WELCOME10",
    ...
  }
}
```

**Validation Errors (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "code": ["Ce code promotionnel existe déjà."],
    "discount_value": ["La valeur de réduction doit être positive."]
  }
}
```

---

### Get Promotion Details

Get details of a specific promotion.

**Endpoint:** `GET /api/promotions/{id}`
**Authentication:** Required (Admin/Manager)

**Response (200):**
```json
{
  "id": 1,
  "code": "SUMMER2026",
  "name": "Summer 2026 Promotion",
  ...
  "usages": [
    {
      "id": 1,
      "promotion_id": 1,
      "user_id": 5,
      "order_id": 123,
      "discount_applied": 1000,
      "created_at": "2026-06-15T10:30:00.000000Z"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "message": "Promotion non trouvée."
}
```

---

### Update Promotion

Update an existing promotion. Supports partial updates.

**Endpoint:** `PUT /api/promotions/{id}`
**Authentication:** Required (Admin/Manager)

**Request Body (example - partial update):**
```json
{
  "is_active": false,
  "expires_at": "2026-09-30 23:59:59"
}
```

**Success Response (200):**
```json
{
  "message": "Promotion mise à jour avec succès.",
  "promotion": {
    "id": 1,
    "code": "SUMMER2026",
    ...
  }
}
```

---

### Delete Promotion

Delete a promotion. Orders will retain promotion_code and discount_amount for historical records.

**Endpoint:** `DELETE /api/promotions/{id}`
**Authentication:** Required (Admin/Manager)

**Success Response (200):**
```json
{
  "message": "Promotion supprimée avec succès."
}
```

---

### Get Promotion Usage History

Get a paginated list of all times a promotion was used.

**Endpoint:** `GET /api/promotions/{id}/usages`
**Authentication:** Required (Admin/Manager)

**Query Parameters:**
- `per_page` (optional, default: 15)
- `page` (optional, default: 1)

**Response (200):**
```json
{
  "promotion": {
    "id": 1,
    "code": "SUMMER2026",
    "name": "Summer 2026 Promotion",
    ...
  },
  "usages": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "promotion_id": 1,
        "user_id": 5,
        "order_id": 123,
        "discount_applied": 1000,
        "created_at": "2026-06-15T10:30:00.000000Z",
        "user": {
          "id": 5,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com"
        },
        "order": {
          "id": 123,
          "string_id": "PF-2026-123",
          "montant": 15000,
          "discount_amount": 1000
        }
      }
    ],
    "per_page": 15,
    "total": 15
  }
}
```

---

## Using Promotions in Orders

### Authenticated User Order

Include `promotion_code` in your order request:

**Endpoint:** `POST /api/add-order-with-payment`
**Authentication:** Required

**Request Body:**
```json
{
  "customer_id": 1,
  "address": "Dakar, Sénégal",
  "promotion_code": "SUMMER2026",
  "delivery_fee": 500
}
```

The discount will be automatically calculated and applied. The response will include the order with `discount_amount` and `promotion_code` fields populated.

---

### Guest Order

**Endpoint:** `POST /api/guest-order`
**Authentication:** None

**Request Body:**
```json
{
  "guest_first_name": "Jean",
  "guest_last_name": "Dupont",
  "guest_phone_number": "+221771234567",
  "guest_email": "jean@example.com",
  "address": "Dakar",
  "cart_items": [
    {
      "type": "box",
      "box_type_id": 1,
      "quantity": 2
    },
    {
      "type": "slice",
      "slice_id": 5,
      "quantity": 3
    }
  ],
  "promotion_code": "SUMMER2026",
  "delivery_fee": 500
}
```

**Note:** Guest orders cannot use promotions with `first_order_only: true` since we cannot verify their order history.

---

## Discount Types Explained

### 1. Percentage Discount

**Example:**
```json
{
  "discount_type": "percentage",
  "discount_value": 10,
  "maximum_discount": 2000
}
```

- Applies 10% discount on order amount
- Capped at 2000 CFA maximum discount
- If order is 25,000 CFA → discount = min(2500, 2000) = 2000 CFA

### 2. Fixed Amount Discount

**Example:**
```json
{
  "discount_type": "fixed_amount",
  "discount_value": 1500
}
```

- Applies exactly 1500 CFA discount
- Cannot exceed order amount
- If order is 1000 CFA → discount = 1000 CFA (not 1500)

### 3. Free Delivery

**Example:**
```json
{
  "discount_type": "free_delivery",
  "discount_value": 0
}
```

- Discount equals the delivery fee
- Must pass `delivery_fee` parameter when validating/applying
- If delivery_fee is 500 CFA → discount = 500 CFA

---

## Business Rules

### Validation Order

When a promotion code is applied, the system checks:

1. Code exists in database
2. Promotion is active (`is_active = true`)
3. Current date is within validity period (`starts_at` to `expires_at`)
4. Total usage limit not reached (`usage_count < usage_limit_total`)
5. User can use it:
   - Per-user limit not reached
   - First order restriction satisfied (if applicable)
6. Minimum order amount is met
7. Calculate discount based on type

### First Order Only Restriction

- Authenticated users: Checks order history in database
- Guest users: Cannot use these promotions (we can't verify their history)

### Usage Limits

- **Total limit** (`usage_limit_total`): Across all users
- **Per-user limit** (`usage_limit_per_user`): Per authenticated user
- Guest orders count toward total limit but not per-user limit

### Minimum Order Amount

If `minimum_order_amount` is set:
- Order subtotal must be ≥ minimum_order_amount
- Otherwise returns error: "Montant minimum de commande non atteint. Minimum requis: X CFA."

---

## Error Handling

### Common Error Responses

**Unauthorized (401):**
```json
{
  "message": "Unauthenticated."
}
```

**Forbidden (403):**
```json
{
  "message": "Accès non autorisé."
}
```

**Not Found (404):**
```json
{
  "message": "Promotion non trouvée."
}
```

**Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**Server Error (500):**
```json
{
  "message": "Erreur lors de la récupération des promotions."
}
```

---

## Code Examples

### JavaScript (Axios)

```javascript
// Validate promo code
const validatePromo = async (code, orderAmount) => {
  try {
    const response = await axios.post('https://api.profood-app.com/api/validate-promo-code', {
      code: code,
      order_amount: orderAmount,
      delivery_fee: 500
    });

    if (response.data.valid) {
      console.log('Discount:', response.data.discount_amount, 'CFA');
      return response.data;
    } else {
      console.error('Invalid:', response.data.error);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// Create promotion (admin)
const createPromotion = async (token, promotionData) => {
  try {
    const response = await axios.post(
      'https://api.profood-app.com/api/promotions',
      promotionData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Created:', response.data.promotion);
    return response.data;
  } catch (error) {
    if (error.response.status === 422) {
      console.error('Validation errors:', error.response.data.errors);
    }
    return null;
  }
};
```

### PHP (Guzzle)

```php
use GuzzleHttp\Client;

// Validate promo code
$client = new Client(['base_uri' => 'https://api.profood-app.com/api/']);

$response = $client->post('validate-promo-code', [
    'json' => [
        'code' => 'SUMMER2026',
        'order_amount' => 10000,
        'delivery_fee' => 500
    ]
]);

$data = json_decode($response->getBody(), true);

if ($data['valid']) {
    echo "Discount: " . $data['discount_amount'] . " CFA\n";
}

// List promotions (admin)
$response = $client->get('promotions', [
    'headers' => [
        'Authorization' => 'Bearer ' . $token
    ],
    'query' => [
        'per_page' => 20,
        'page' => 1
    ]
]);

$promotions = json_decode($response->getBody(), true);
```

---

## Database Schema

### promotions table

```sql
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,  -- percentage, fixed_amount, free_delivery
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    usage_limit_total INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    first_order_only BOOLEAN DEFAULT FALSE,
    applicable_to JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(starts_at, expires_at);
```

### promotion_usages table

```sql
CREATE TABLE promotion_usages (
    id BIGSERIAL PRIMARY KEY,
    promotion_id BIGINT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_applied DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_promotion_usages_promotion ON promotion_usages(promotion_id);
CREATE INDEX idx_promotion_usages_user ON promotion_usages(user_id);
CREATE INDEX idx_promotion_usages_order ON promotion_usages(order_id);
```

### orders table (new columns)

```sql
ALTER TABLE orders ADD COLUMN promotion_id BIGINT REFERENCES promotions(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN promotion_code VARCHAR(50);

CREATE INDEX idx_orders_promotion ON orders(promotion_id);
```

---

## Testing with cURL

### Validate Promo Code

```bash
curl -X POST https://api.profood-app.com/api/validate-promo-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER2026",
    "order_amount": 10000,
    "delivery_fee": 500
  }'
```

### Create Promotion (Admin)

```bash
curl -X POST https://api.profood-app.com/api/promotions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME10",
    "name": "Welcome Offer",
    "discount_type": "percentage",
    "discount_value": 10,
    "is_active": true
  }'
```

### List Promotions

```bash
curl -X GET "https://api.profood-app.com/api/promotions?per_page=20&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support & Questions

For implementation questions or issues:
1. Check this API reference
2. Review PROMOTION_SYSTEM_IMPLEMENTATION.md for detailed implementation guide
3. Check Laravel logs for detailed error information
4. Test endpoints with Postman or similar tools

---

**Last Updated:** February 8, 2026
**API Version:** 1.0
**Laravel Version:** 9.x
