# Smart Restaurant API Contract

## 1. Summary Endpoint Table

### Session Management (Public)

| Method | Endpoint                                 | Description            | Request Body            | Response Body         |
| :----- | :--------------------------------------- | :--------------------- | :---------------------- | :-------------------- |
| POST   | `/api/sessions`                          | Start a new session    | `StartSessionRequest`   | `SessionResponse`     |
| GET    | `/api/sessions/{id}`                     | Get session details    | -                       | `SessionResponse`     |
| POST   | `/api/sessions/{id}/cart/items`          | Add item to cart       | `AddCartItemRequest`    | `SessionResponse`     |
| PUT    | `/api/sessions/{id}/cart/items/{itemId}` | Update cart item       | `UpdateCartItemRequest` | `SessionResponse`     |
| DELETE | `/api/sessions/{id}/cart/items/{itemId}` | Remove item from cart  | -                       | `MessageResponse`     |
| POST   | `/api/sessions/{id}/checkout`            | Checkout cart to order | `CheckoutRequest`       | `OrderResponse`       |
| GET    | `/api/sessions/{id}/orders`              | Get session orders     | -                       | `OrderListResponse`   |
| GET    | `/api/sessions/{id}/bill-preview`        | Preview bill           | -                       | `BillPreviewResponse` |
| POST   | `/api/sessions/{id}/request-bill`        | Request bill           | -                       | `MessageResponse`     |

### Kitchen Display System (Role: KITCHEN_STAFF)

| Method | Endpoint                          | Description          | Request Body               | Response Body          |
| :----- | :-------------------------------- | :------------------- | :------------------------- | :--------------------- |
| GET    | `/api/kitchen/orders`             | Get kitchen orders   | -                          | `KdsOrderListResponse` |
| GET    | `/api/kitchen/orders/{id}`        | Get order details    | -                          | `KdsOrderResponse`     |
| PATCH  | `/api/kitchen/orders/{id}/status` | Update order status  | `UpdateOrderStatusRequest` | `OrderResponse`        |
| GET    | `/api/kitchen/orders/stats`       | Get order statistics | -                          | `KdsStatsResponse`     |

### Waiter Features (Role: WAITER)

| Method | Endpoint                                             | Description           | Request Body        | Response Body              |
| :----- | :--------------------------------------------------- | :-------------------- | :------------------ | :------------------------- |
| GET    | `/api/waiter/orders/pending`                         | Get pending orders    | -                   | `PendingOrderListResponse` |
| PATCH  | `/api/waiter/orders/{orderId}/items/{itemId}/accept` | Accept order item     | -                   | `OrderResponse`            |
| PATCH  | `/api/waiter/orders/{orderId}/items/{itemId}/reject` | Reject order item     | `RejectItemRequest` | `OrderResponse`            |
| POST   | `/api/waiter/orders/{orderId}/send-to-kitchen`       | Send order to kitchen | -                   | `OrderResponse`            |
| POST   | `/api/waiter/orders/{orderId}/served`                | Mark order as served  | -                   | `OrderResponse`            |
| GET    | `/api/waiter/bill-requests`                          | Get bill requests     | -                   | `BillRequestListResponse`  |

### Momo Payment (Public except Verify)

| Method | Endpoint                         | Description            | Request Body          | Response Body           |
| :----- | :------------------------------- | :--------------------- | :-------------------- | :---------------------- |
| POST   | `/api/payments/momo/initiate`    | Initiate payment       | `MomoPaymentRequest`  | `MomoPaymentResponse`   |
| POST   | `/api/payments/momo/callback`    | IPN Callback           | `MomoCallbackRequest` | `MomoCallbackResponse`  |
| GET    | `/api/payments/momo/{id}/status` | Check payment status   | -                     | `PaymentStatusResponse` |
| POST   | `/api/payments/momo/{id}/verify` | Verify payment (ADMIN) | -                     | `PaymentStatusResponse` |

---

## 2. Session Management

### Start Session

**Endpoint:** `POST /api/sessions`
**Description:** Starts a new dining session using a QR token. Validates the token and creates a session if one doesn't exist.

**Request Body:**

```json
{
    "token": "string (Required, UUID format)",
    "guestCount": 0 // (Required, Integer, Min: 1)
}
```

**Validation:**

- `token`: Must not be blank. Should be a valid UUID string representing the QR token.
- `guestCount`: Must be at least 1.

**Response (201 Created):**

```json
{
    "success": true,
    "message": "Session started successfully",
    "sessionId": "uuid",
    "tableId": "uuid",
    "tableNumber": "string",
    "status": "ACTIVE",
    "guestCount": 4,
    "startTime": "2023-01-01T12:00:00",
    "cartItems": [],
    "cartTotal": 0
}
```

**Error Responses:**

- `400 Bad Request`: Invalid token, token expired, table already occupied, or validation failure.

### Get Session

**Endpoint:** `GET /api/sessions/{id}`
**Description:** Retrieves the current session details, including cart items and status.

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Session retrieved successfully",
    "sessionId": "uuid",
    "tableId": "uuid",
    "tableNumber": "string",
    "status": "ACTIVE",
    "guestCount": 4,
    "startTime": "2023-01-01T12:00:00",
    "cartItems": [
        {
            "itemId": "uuid",
            "menuItemId": "uuid",
            "menuItemName": "Burger",
            "price": 150000,
            "quantity": 2,
            "totalPrice": 300000,
            "notes": "No onions",
            "modifiers": [
                {
                    "modifierOptionId": "uuid",
                    "modifierOptionName": "Extra Cheese",
                    "priceAdjustment": 10000
                }
            ]
        }
    ],
    "cartTotal": 310000
}
```

**Error Responses:**

- `400 Bad Request`: Session ID not found or invalid format.

### Add to Cart

**Endpoint:** `POST /api/sessions/{id}/cart/items`
**Description:** Adds a menu item to the session's cart.

**Request Body:**

```json
{
    "menuItemId": "uuid (Required)",
    "quantity": 1, // (Required, Min: 1)
    "modifierOptionIds": ["uuid"], // (Optional, List of valid UUIDs)
    "specialInstructions": "string" // (Optional)
}
```

**Validation:**

- `menuItemId`: Must act as a valid UUID referencing an existing MenuItem.
- `quantity`: Must be a positive integer (>= 1).
- `modifierOptionIds`: Must be a list of valid UUIDs referencing ModifierOptions.

**Success Response (200 OK):**
Returns updated `SessionResponse` with the new item in `cartItems`.

**Error Responses:**

- `400 Bad Request`: Item unavailable, invalid modifier options, or validation failure.

### Update Cart Item

**Endpoint:** `PUT /api/sessions/{id}/cart/items/{itemId}`
**Description:** Updates an existing cart item's quantity, modifiers, or instructions.

**Request Body:**

```json
{
    "quantity": 2, // (Optional, Min: 1)
    "modifierOptionIds": ["uuid"], // (Optional, replaces existing list)
    "specialInstructions": "string" // (Optional, replaces existing)
}
```

**Validation:**

- `quantity`: If provided, must be >= 1.
- `modifierOptionIds`: Must be valid UUIDs.

**Success Response (200 OK):**
Returns updated `SessionResponse`.

**Error Responses:**

- `400 Bad Request`: Cart item not found, invalid modifiers, or validation error.

### Checkout

**Endpoint:** `POST /api/sessions/{id}/checkout`
**Description:** Converts cart items into a submitted order. Clears the cart upon success.

**Request Body:**

```json
{
    "specialInstructions": "string" // (Optional, order-level instructions)
}
```

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Order placed successfully",
    "orderId": "uuid",
    "orderNumber": "ORD-20230101-001",
    "tableId": "uuid",
    "tableNumber": "T1",
    "status": "PENDING",
    "items": [
        {
            "id": "uuid",
            "menuItemName": "Burger",
            "quantity": 2,
            "unitPrice": 150000,
            "totalPrice": 300000,
            "status": "PENDING",
            "specialInstructions": "No onions",
            "modifiers": [
                {
                    "modifierOptionName": "Extra Cheese",
                    "priceAdjustment": 10000
                }
            ]
        }
    ],
    "subtotal": 300000,
    "taxAmount": 30000, // 10% tax
    "totalAmount": 330000,
    "specialInstructions": "Deliver fast",
    "estimatedPrepTime": 15, // Minutes
    "sentToKitchenAt": null,
    "readyAt": null,
    "servedAt": null,
    "createdAt": "2023-01-01T12:00:00",
    "updatedAt": "2023-01-01T12:00:00"
}
```

**Error Responses:**

- `400 Bad Request`: Cart is empty, session invalid, or internal processing error.

### Bill Preview

**Endpoint:** `GET /api/sessions/{id}/bill-preview`
**Description:** Generates a preview of the final bill, including subtotal, tax, and service charges.

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Bill preview generated",
    "sessionId": "uuid",
    "tableNumber": "T1",
    "guestCount": 4,
    "items": [
        {
            "menuItemName": "Burger",
            "quantity": 2,
            "unitPrice": 150000,
            "modifiersPrice": 10000,
            "lineTotal": 310000,
            "modifiers": ["Extra Cheese (+10000)"],
            "specialInstructions": "No onions"
        }
    ],
    "totalItemCount": 2,
    "subtotal": 310000,
    "taxRate": 0.1,
    "taxAmount": 31000,
    "serviceChargeRate": 0.05,
    "serviceCharge": 15500,
    "totalAmount": 356500,
    "currency": "VND",
    "orderCount": 1,
    "sessionStartedAt": "2023-01-01T12:00:00"
}
```

**Error Responses:**

- `400 Bad Request`: Session has no orders or invalid session ID.

---

## 3. Kitchen Operations

### Get Kitchen Orders

**Endpoint:** `GET /api/kitchen/orders`
**Query Parameters:**

- `status` (Optional): Filter by `IN_KITCHEN`, `PREPARING`, `READY`. (default: all active)

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Kitchen orders retrieved",
    "orders": [
        {
            "orderId": "uuid",
            "orderNumber": "ORD-20230101-001",
            "tableId": "uuid",
            "tableNumber": "T1",
            "status": "IN_KITCHEN",
            "items": [
                {
                    "itemId": "uuid",
                    "menuItemName": "Burger",
                    "quantity": 2,
                    "status": "PREPARING",
                    "specialInstructions": "No onions",
                    "modifiers": ["Extra Cheese"]
                }
            ],
            "specialInstructions": "Allergic to nuts",
            "estimatedPrepTime": 15,
            "sentToKitchenAt": "2023-01-01T12:00:00",
            "createdAt": "2023-01-01T11:55:00",
            "totalItems": 2,
            "completedItems": 0,
            "elapsedMinutes": 5,
            "overdueMinutes": 0,
            "isOverdue": false
        }
    ],
    "count": 1
}
```

### Update Order Status

**Endpoint:** `PATCH /api/kitchen/orders/{id}/status`
**Description:** Updates the status of an order (e.g., when starting preparation or marking ready).

**Request Body:**

```json
{
    "status": "PREPARING", // (Required: PREPARING, READY, SERVED, COMPLETED)
    "notes": "Started cooking" // (Optional)
}
```

**Validation:**

- `status`: Must be a valid OrderStatus enum value.
- Status transitions must logically flow (e.g., `IN_KITCHEN` -> `PREPARING`).

**Success Response (200 OK):**
Returns updated `OrderResponse`.

### Get KDS Stats

**Endpoint:** `GET /api/kitchen/orders/stats`
**Description:** Provides real-time statistics for the kitchen dashboard.

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Statistics retrieved",
    "receivedCount": 5, // New orders (IN_KITCHEN)
    "preparingCount": 3, // Currently cooking (PREPARING)
    "readyCount": 2, // Waiting for pickup (READY)
    "completedCount": 50, // Today's completed orders
    "totalActiveOrders": 10,
    "overdueOrders": 1 // Exceeded estimated prep time
}
```

---

## 4. Waiter Operations

### Get Pending Orders

**Endpoint:** `GET /api/waiter/orders/pending`
**Description:** Retrieves orders submitted by customers but not yet confirmed by staff.

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Pending orders retrieved",
    "orders": [
        {
            "orderId": "uuid",
            "orderNumber": "ORD-20230101-002",
            "tableId": "uuid",
            "tableNumber": "T5",
            "orderStatus": "PENDING",
            "items": [
                // List of items in the order
            ],
            "totalAmount": 150000,
            "specialInstructions": "Extra napkins",
            "createdAt": "2023-01-01T12:05:00",
            "pendingItemsCount": 3
        }
    ],
    "count": 1
}
```

### Reject Item

**Endpoint:** `PATCH /api/waiter/orders/{orderId}/items/{itemId}/reject`
**Description:** Rejects a specific item from a pending order (e.g., out of stock).

**Request Body:**

```json
{
    "reason": "Out of stock" // (Required, Not Blank)
}
```

**Validation:**

- `reason`: Required string explaining rejection.

**Success Response (200 OK):**
Returns updated `OrderResponse`. Item status becomes `REJECTED`.

### Get Bill Requests

**Endpoint:** `GET /api/waiter/bill-requests`
**Description:** Lists tables that have requested their bill.

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Bill requests retrieved",
    "requests": [
        {
            "sessionId": "uuid",
            "tableId": "uuid",
            "tableNumber": "T3",
            "status": "BILL_REQUESTED",
            "guestCount": 2,
            "startedAt": "2023-01-01T11:00:00",
            "billRequestedAt": "2023-01-01T12:30:00",
            "estimatedTotal": 500000,
            "orderCount": 2
        }
    ],
    "count": 1
}
```

---

## 5. Momo Payment

### Initiate Payment

**Endpoint:** `POST /api/payments/momo/initiate`
**Description:** Initiates a payment transaction with Momo.

**Request Body:**

```json
{
    "sessionId": "uuid (Required)",
    "returnUrl": "http://frontend-url.com/payment-result" // (Optional)
}
```

**Validation:**

- `sessionId`: Must be a valid UUID of a session in `BILL_REQUESTED` state.

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Payment initiated",
    "paymentId": "uuid",
    "requestId": "PAY-20230101-001",
    "payUrl": "https://test-payment.momo.vn/v2/...",
    "deeplink": "momo://...",
    "qrCodeUrl": "https://static.momo.vn/...",
    "amount": 356500
}
```

**Error Responses:**

- `400 Bad Request`: Session not ready for payment or Momo API error.

### Callback (IPN)

**Endpoint:** `POST /api/payments/momo/callback`
**Description:** Endpoint for Momo servers to notify transaction status.

**Request Body:** (Standard Momo IPN Payload)

```json
{
    "partnerCode": "MOMO...",
    "orderId": "PAY-20230101-001",
    "requestId": "PAY-20230101-001",
    "amount": 356500,
    "resultCode": 0, // 0 = Success
    "message": "Success",
    "responseTime": 1672531200000,
    "extraData": "{\"sessionId\":\"uuid\"}",
    "signature": "hmac_signature_string"
}
```

**Response (200 OK):**

```json
{
    "status": 0,
    "message": "Processed"
}
```

### Check Status

**Endpoint:** `GET /api/payments/momo/{id}/status`
**Description:** Checks the status of a payment transaction.

**Success Response (200 OK):**

```json
{
    "success": true,
    "message": "Payment status retrieved",
    "paymentId": "uuid",
    "sessionId": "uuid",
    "method": "MOMO",
    "status": "COMPLETED", // PENDING, PROCESSING, COMPLETED, FAILED
    "totalAmount": 356500,
    "paymentReference": "PAY-20230101-001",
    "gatewayTransactionId": "MOMO123456",
    "paidAt": "2023-01-01T12:35:00",
    "createdAt": "2023-01-01T12:30:00"
}
```
