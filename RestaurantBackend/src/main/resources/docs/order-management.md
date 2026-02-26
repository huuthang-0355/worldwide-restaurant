# Order & Session Management - Implementation Plan

## Overview

This plan covers the implementation of **Session Management**, **Order Management**, **Kitchen Display System (KDS)**, and **Waiter Features**. The architecture is designed to be payment-gateway agnostic, making future Momo integration straightforward.

---

## 1. API Summary

### Session Management

| Method | Endpoint                                 | Description                              | Access       |
| :----- | :--------------------------------------- | :--------------------------------------- | :----------- |
| POST   | `/api/sessions`                          | Start a new dining session (via QR scan) | Public       |
| GET    | `/api/sessions/{id}`                     | Get session details with current cart    | Public       |
| POST   | `/api/sessions/{id}/cart/items`          | Add item to cart                         | Public       |
| PUT    | `/api/sessions/{id}/cart/items/{itemId}` | Update cart item quantity/modifiers      | Public       |
| DELETE | `/api/sessions/{id}/cart/items/{itemId}` | Remove item from cart                    | Public       |
| POST   | `/api/sessions/{id}/checkout`            | Submit cart as order                     | Public       |
| GET    | `/api/sessions/{id}/orders`              | Get all orders in current session        | Public       |
| GET    | `/api/sessions/{id}/bill-preview`        | Preview bill before payment              | Public       |
| POST   | `/api/sessions/{id}/request-bill`        | Request bill (notifies waiter)           | Public       |
| POST   | `/api/admin/sessions/{id}/close`         | Close session after payment              | ADMIN/WAITER |

### Order Management (Kitchen)

| Method | Endpoint                          | Description                             | Access        |
| :----- | :-------------------------------- | :-------------------------------------- | :------------ |
| GET    | `/api/kitchen/orders`             | Get orders for KDS (sorted by time)     | KITCHEN_STAFF |
| GET    | `/api/kitchen/orders/{id}`        | Get order details                       | KITCHEN_STAFF |
| PATCH  | `/api/kitchen/orders/{id}/status` | Update order status                     | KITCHEN_STAFF |
| GET    | `/api/kitchen/orders/stats`       | Get order statistics (counts by status) | KITCHEN_STAFF |

### Waiter Features

| Method | Endpoint                                        | Description                            | Access |
| :----- | :---------------------------------------------- | :------------------------------------- | :----- |
| GET    | `/api/waiter/tables`                            | Get tables assigned to waiter          | WAITER |
| GET    | `/api/waiter/orders/pending`                    | Get pending orders awaiting acceptance | WAITER |
| PATCH  | `/api/waiter/orders/{id}/items/{itemId}/accept` | Accept order item                      | WAITER |
| PATCH  | `/api/waiter/orders/{id}/items/{itemId}/reject` | Reject order item with reason          | WAITER |
| POST   | `/api/waiter/orders/{id}/send-to-kitchen`       | Send accepted items to kitchen         | WAITER |
| PATCH  | `/api/waiter/orders/{id}/served`                | Mark order as served                   | WAITER |
| GET    | `/api/waiter/bill-requests`                     | Get tables requesting bills            | WAITER |
| POST   | `/api/waiter/sessions/{id}/process-payment`     | Record payment (prepares for Momo)     | WAITER |

### Admin Order Management

| Method | Endpoint              | Description                   | Access |
| :----- | :-------------------- | :---------------------------- | :----- |
| GET    | `/api/admin/orders`   | Get all orders with filters   | ADMIN  |
| GET    | `/api/admin/sessions` | Get all sessions with filters | ADMIN  |

---

## 2. Data Models

### 2.1 New Enums

**SessionStatus.java**

```
ACTIVE          → Guest is currently dining
BILL_REQUESTED  → Guest has requested the bill
PAYMENT_PENDING → Bill generated, awaiting payment
COMPLETED       → Payment received, session closed
CANCELLED       → Session cancelled (no orders or void)
```

**OrderStatus.java**

```
PENDING         → Submitted by customer, awaiting waiter
ACCEPTED        → Accepted by waiter, not yet sent to kitchen
IN_KITCHEN      → Sent to kitchen (appears in KDS)
PREPARING       → Kitchen started preparation
READY           → Ready for pickup/serving
SERVED          → Delivered to customer
COMPLETED       → Confirmed complete
CANCELLED       → Order cancelled
```

**OrderItemStatus.java**

```
PENDING         → Awaiting waiter review
ACCEPTED        → Accepted by waiter
REJECTED        → Rejected by waiter (with reason)
PREPARING       → Being prepared
READY           → Item ready
SERVED          → Item served
```

**PaymentMethod.java** (Momo-ready)

```
CASH            → Cash payment
CARD            → Card payment at terminal
MOMO            → Momo e-wallet (future)
BANK_TRANSFER   → Bank transfer
```

**PaymentStatus.java**

```
PENDING         → Awaiting payment
PROCESSING      → Payment in progress (for async like Momo)
COMPLETED       → Payment successful
FAILED          → Payment failed
REFUNDED        → Payment refunded
```

---

### 2.2 Entity: Session

Represents a dining session from QR scan to checkout.

```java
@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private Table table;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;           // ACTIVE, BILL_REQUESTED, etc.

    @Column(name = "guest_count")
    private Integer guestCount;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<Order> orders;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<CartItem> cartItems;       // Current unpurchased cart

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL)
    private Payment payment;                // Final payment record

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

### 2.3 Entity: CartItem

Temporary cart storage before checkout.

```java
@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String specialInstructions;

    // Store selected modifiers as JSON or separate table
    @OneToMany(mappedBy = "cartItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItemModifier> selectedModifiers;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;           // Price at time of adding

    @Column(name = "modifiers_price")
    private BigDecimal modifiersPrice;      // Sum of modifier adjustments

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

### 2.4 Entity: Order

A submitted order (converted from cart items at checkout).

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;             // Human-readable: ORD-20260223-001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private Table table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waiter_id")
    private User waiter;                    // Assigned waiter

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal;

    @Column(name = "tax_amount")
    private BigDecimal taxAmount;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;     // Order-level notes

    @Column(name = "estimated_prep_time")
    private Integer estimatedPrepTime;      // Minutes (max of all items)

    @Column(name = "sent_to_kitchen_at")
    private LocalDateTime sentToKitchenAt;

    @Column(name = "ready_at")
    private LocalDateTime readyAt;

    @Column(name = "served_at")
    private LocalDateTime servedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

### 2.5 Entity: OrderItem

Individual item within an order.

```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "modifiers_price")
    private BigDecimal modifiersPrice;

    @Column(name = "line_total", nullable = false)
    private BigDecimal lineTotal;           // (unitPrice + modifiersPrice) * quantity

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderItemStatus status;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;         // If rejected by waiter

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes;        // From MenuItem at order time

    @Column(name = "started_at")
    private LocalDateTime startedAt;        // When prep started

    @Column(name = "completed_at")
    private LocalDateTime completedAt;      // When item ready

    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL)
    private List<OrderItemModifier> selectedModifiers;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

### 2.6 Entity: OrderItemModifier

Selected modifiers for an order item.

```java
@Entity
@Table(name = "order_item_modifiers")
public class OrderItemModifier {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modifier_option_id", nullable = false)
    private ModifierOption modifierOption;

    @Column(name = "modifier_name")
    private String modifierName;            // Snapshot at order time

    @Column(name = "option_name")
    private String optionName;              // Snapshot at order time

    @Column(name = "price_adjustment")
    private BigDecimal priceAdjustment;     // Snapshot at order time
}
```

---

### 2.7 Entity: Payment (Momo-Ready)

Designed for easy payment gateway integration.

```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "payment_reference", unique = true)
    private String paymentReference;        // Internal reference

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Column(name = "tax_amount")
    private BigDecimal taxAmount;

    @Column(name = "service_charge")
    private BigDecimal serviceCharge;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    // === Momo Integration Fields ===
    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;    // Momo's transaction ID

    @Column(name = "gateway_request_id")
    private String gatewayRequestId;        // Our request ID to Momo

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;         // Full response JSON for debugging

    @Column(name = "gateway_callback_at")
    private LocalDateTime gatewayCallbackAt;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;               // Momo QR code URL for payment

    @Column(name = "deep_link")
    private String deepLink;                // Momo app deep link
    // ===============================

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;               // Waiter/Admin who processed

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

### 2.8 Entity: TableAssignment

Track waiter-table assignments.

```java
@Entity
@Table(name = "table_assignments")
public class TableAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private Table table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waiter_id", nullable = false)
    private User waiter;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

## 3. Implementation Steps

### Phase 1: Core Session & Cart (Foundation)

**Step 1.1: Create Enums**

- Create `model/SessionStatus.java`
- Create `model/OrderStatus.java`
- Create `model/OrderItemStatus.java`
- Create `model/PaymentMethod.java`
- Create `model/PaymentStatus.java`

**Step 1.2: Create Entities**

- Create `model/Session.java`
- Create `model/CartItem.java`
- Create `model/CartItemModifier.java`
- Create `model/Order.java`
- Create `model/OrderItem.java`
- Create `model/OrderItemModifier.java`
- Create `model/Payment.java`
- Create `model/TableAssignment.java`

**Step 1.3: Create Repositories**

- Create `repo/SessionRepo.java` with `findByTableIdAndStatus()`
- Create `repo/CartItemRepo.java`
- Create `repo/OrderRepo.java` with filtering/sorting queries
- Create `repo/OrderItemRepo.java`
- Create `repo/PaymentRepo.java`
- Create `repo/TableAssignmentRepo.java`

**Step 1.4: Create DTOs for Session & Cart**

- `dto/request/session/StartSessionRequest.java` - token, guestCount
- `dto/request/cart/AddCartItemRequest.java` - menuItemId, quantity, modifiers, notes
- `dto/request/cart/UpdateCartItemRequest.java` - quantity, modifiers, notes
- `dto/response/SessionResponse.java` - session details with cart
- `dto/response/CartItemResponse.java` - cart item with modifiers

**Step 1.5: Create Session Service & Controller**

- Create `service/SessionService.java`
    - `startSession()` - Validate QR token, check no active session, create new
    - `getSession()` - Get session with cart items
    - `addToCart()` - Add menu item with modifiers
    - `updateCartItem()` - Update quantity/modifiers
    - `removeCartItem()` - Remove from cart
- Create `controller/SessionController.java`

---

### Phase 2: Order Submission & Management

**Step 2.1: Create Order DTOs**

- `dto/request/order/CheckoutRequest.java` - specialInstructions
- `dto/request/order/UpdateOrderStatusRequest.java` - status
- `dto/request/order/RejectItemRequest.java` - reason
- `dto/response/OrderResponse.java` - full order details
- `dto/response/OrderItemResponse.java` - item with modifiers
- `dto/response/OrderListResponse.java` - paginated orders

**Step 2.2: Create Order Service**

- Create `service/OrderService.java`
    - `checkout()` - Convert cart to order, generate order number
    - `getOrdersBySession()` - List orders for a session
    - `getOrderDetails()` - Full order with items
    - `updateOrderStatus()` - State machine for order status
    - `generateOrderNumber()` - Format: ORD-YYYYMMDD-XXX

**Step 2.3: Update Session Controller**

- Add `POST /sessions/{id}/checkout`
- Add `GET /sessions/{id}/orders`

---

### Phase 3: Kitchen Display System (KDS)

**Step 3.1: Create KDS DTOs**

- `dto/response/KdsOrderResponse.java` - Optimized for kitchen view
- `dto/response/KdsOrderItemResponse.java` - Item with prep time alert
- `dto/response/KdsStatsResponse.java` - Order counts by status

**Step 3.2: Create Kitchen Service**

- Create `service/KitchenService.java`
    - `getKitchenOrders()` - Orders with status IN_KITCHEN/PREPARING/READY
    - `updateOrderStatus()` - Progress through kitchen states
    - `getOrderStats()` - Counts by status
    - `checkPrepTimeAlerts()` - Flag overdue orders

**Step 3.3: Create Kitchen Controller**

- Create `controller/KitchenController.java`
- Add `@PreAuthorize("hasRole('KITCHEN_STAFF')")` at class level

**Step 3.4: Prep Time Alert Logic**

- Add computed field `isOverdue` based on `sentToKitchenAt` + `estimatedPrepTime`
- Add computed field `overdueMinutes` for timer display

---

### Phase 4: Waiter Features

**Step 4.1: Create Waiter DTOs**

- `dto/request/waiter/AssignTableRequest.java` - waiterId
- `dto/response/WaiterTableResponse.java` - Table with active session/orders
- `dto/response/PendingOrderResponse.java` - Orders awaiting acceptance
- `dto/response/BillRequestResponse.java` - Tables requesting bills

**Step 4.2: Create Waiter Service**

- Create `service/WaiterService.java`
    - `getAssignedTables()` - Tables for current waiter
    - `getPendingOrders()` - Orders with PENDING status
    - `acceptOrderItem()` - Mark item as ACCEPTED
    - `rejectOrderItem()` - Mark item as REJECTED with reason
    - `sendToKitchen()` - Update order status to IN_KITCHEN
    - `markAsServed()` - Update order status to SERVED
    - `getBillRequests()` - Sessions with BILL_REQUESTED status

**Step 4.3: Create Waiter Controller**

- Create `controller/WaiterController.java`
- Add `@PreAuthorize("hasRole('WAITER')")` at class level

**Step 4.4: Create Table Assignment Service**

- Create `service/TableAssignmentService.java`
    - `assignWaiter()` - Assign waiter to table
    - `getAssignedWaiter()` - Get waiter for table
    - `unassignWaiter()` - Remove assignment

---

### Phase 5: Bill & Payment with Momo Integration

**Step 5.1: Create Payment DTOs**

Request DTOs:

- `dto/request/payment/MomoPaymentRequest.java` - sessionId, returnUrl
- `dto/request/payment/MomoCallbackRequest.java` - Full IPN payload from Momo

Response DTOs:

- `dto/response/BillPreviewResponse.java` - Itemized bill with totals
- `dto/response/BillPreviewItemResponse.java` - Individual order line items
- `dto/response/MomoPaymentResponse.java` - payUrl, deeplink, qrCodeUrl, requestId
- `dto/response/MomoCallbackResponse.java` - Response to Momo IPN
- `dto/response/PaymentResponse.java` - Payment status and details
- `dto/response/PaymentStatusResponse.java` - Current payment state

**Step 5.2: Create Bill Service**

- Create `service/BillService.java`
    - `previewBill(sessionId)` - Calculate totals, tax, service charge from all orders
    - `requestBill(sessionId)` - Update session status to BILL_REQUESTED
    - `calculateSessionTotal(sessionId)` - Sum all order totals in session
    - `generateBillPdf(sessionId)` - Optional PDF generation (using iText/PDFBox)

**Step 5.3: Create Momo Configuration**

- Create `config/MomoConfig.java`
    - Load Momo credentials from application.properties
    - Bean for OkHttpClient (HTTP client for Momo API)
    - Bean for Gson (JSON serialization)
    - Configuration validation on startup

**Step 5.4: Create Momo Security Utility**

- Create `util/MomoSecurityUtil.java`
    - `signHmacSHA256(data, secretKey)` - Generate HMAC SHA256 signature
    - `verifySignature(rawData, signature, secretKey)` - Verify Momo callback signature
    - `buildRawSignature(params)` - Build signature string from parameters (alphabetically sorted)

**Step 5.5: Create Momo Service**

- Create `service/MomoService.java`
    - `initiatePayment(sessionId, returnUrl)` - Create Momo payment request
        - Generate unique requestId (PAY-YYYYMMDD-XXX)
        - Calculate total from session orders
        - Build Momo API request with signature
        - Call Momo create payment endpoint
        - Save Payment record with PROCESSING status
        - Return MomoPaymentResponse with QR/deeplink
    - `handleCallback(callbackRequest)` - Process Momo IPN callback
        - Verify signature from Momo
        - Find Payment by requestId
        - Check idempotency (already processed?)
        - Validate amount matches
        - Update Payment based on resultCode
        - Complete or fail session
        - Return success response to Momo
    - `checkPaymentStatus(paymentId)` - Query Momo for payment status
        - Build query request with signature
        - Call Momo query endpoint
        - Return current status
    - `verifyPayment(paymentId)` - Manual verification (admin tool)
        - Query Momo API for transaction
        - Reconcile with local Payment record
        - Update if discrepancy found

**Step 5.6: Create Momo DTOs (Internal)**

- `dto/momo/MomoCreatePaymentRequest.java` - Request to Momo API
- `dto/momo/MomoCreatePaymentResponse.java` - Response from Momo API
- `dto/momo/MomoQueryRequest.java` - Query status request
- `dto/momo/MomoQueryResponse.java` - Query status response

**Step 5.7: Create Payment Controller**

- Create `controller/MomoPaymentController.java`
    - `POST /api/payments/momo/initiate` - Initiate payment (Public)
    - `POST /api/payments/momo/callback` - IPN callback handler (Public, from Momo servers)
    - `GET /api/payments/momo/{id}/status` - Check payment status (Public)
    - `POST /api/payments/momo/{id}/verify` - Manual verification (ADMIN only)

**Step 5.8: Update Session Service**

- Add to `service/SessionService.java`
    - `requestBill(sessionId)` - Update session status to BILL_REQUESTED
    - `getBillPreview(sessionId)` - Calculate and return bill preview
    - `closeSession(sessionId)` - Mark session as COMPLETED (called after payment)

**Step 5.9: Create Payment Gateway Interface (Extensibility)**

```java
public interface PaymentGateway {
    PaymentInitResponse initiate(PaymentRequest request);
    PaymentStatusResponse checkStatus(String transactionId);
    CallbackResponse handleCallback(String payload, String signature);
}

// Implementations:
// - MomoPaymentGateway (current)
// - VNPayPaymentGateway (future)
// - StripePaymentGateway (future)
```

**Step 5.10: Error Handling & Retry**

- Implement exponential backoff for Momo API calls
- Handle timeout scenarios (15-minute payment window)
- Log all Momo interactions for audit trail
- Return 200 OK to Momo IPN even on errors (prevent spam)
- Store failed payments for manual reconciliation

---

### Phase 6: Security Configuration Updates

**Step 6.1: Update SecurityConfig.java**

```java
// Public endpoints (QR token validation applied in service layer)
"/api/sessions/**"  // Guest session management

// Payment endpoints
"/api/payments/momo/callback"  // Momo IPN callback (signature validation in service)
"/api/payments/momo/initiate"  // Payment initiation (QR token validation required)
"/api/payments/momo/*/status"  // Payment status check (public)

// Role-based endpoints
.requestMatchers("/api/kitchen/**").hasRole("KITCHEN_STAFF")
.requestMatchers("/api/waiter/**").hasRole("WAITER")
.requestMatchers("/api/payments/momo/*/verify").hasRole("ADMIN")
```

**Step 6.2: Session Token Validation**

- Reuse `QrTokenService.validateToken()` for session endpoints
- Add session ID validation to ensure guest owns the session
- Apply QR validation to payment initiation endpoint

**Step 6.3: Environment Configuration**

Add to `application.properties` or `application.yml`:

```properties
# Momo Payment Gateway
momo.partner-code=${MOMO_PARTNER_CODE:MOMOBKUN20180529}
momo.access-key=${MOMO_ACCESS_KEY:klm05TvNBzhg7h7j}
momo.secret-key=${MOMO_SECRET_KEY:at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa}
momo.endpoint=${MOMO_ENDPOINT:https://test-payment.momo.vn}
momo.redirect-url=${MOMO_REDIRECT_URL:http://localhost:3000/payment/result}
momo.ipn-url=${MOMO_IPN_URL:https://your-domain.com/api/payments/momo/callback}

# Payment Configuration
payment.timeout-minutes=15
payment.currency=VND
payment.min-amount=10000
payment.max-amount=50000000

# Restaurant Business Rules
restaurant.tax-rate=0.10
restaurant.service-charge-rate=0.05
restaurant.prep-time-alert-minutes=15
restaurant.order-timeout-minutes=30
```

**Step 6.4: Signature Verification Middleware**

- Implement `@Component MomoSignatureValidator`
- Intercept all `/api/payments/momo/callback` requests
- Verify HMAC SHA256 signature before processing
- Reject invalid signatures with 401 Unauthorized
- Log all signature validation attempts for security audit

---

## 4. Order State Machine

```
Customer Flow:
[Cart] → POST /checkout → [PENDING]

Waiter Flow:
[PENDING] → Accept all items → [ACCEPTED]
[ACCEPTED] → Send to kitchen → [IN_KITCHEN]
[SERVED] → (auto after all items served)

Kitchen Flow:
[IN_KITCHEN] → Start preparing → [PREPARING]
[PREPARING] → Mark ready → [READY]

Delivery:
[READY] → Waiter marks served → [SERVED]
[SERVED] → Complete session → [COMPLETED]
```

---

## 5. Momo Payment Integration

### 5.1 Overview

Integration with Momo e-wallet using official Momo Payment SDK for Java.

- **SDK Repository**: https://github.com/momo-wallet/java
- **Payment Method**: QR Code & App Deep Link
- **Flow Type**: Asynchronous with IPN callback

### 5.2 Payment Flow

#### Complete Transaction Flow:

```
1. Guest browses menu and adds items to cart
   └─> Session created (SessionStatus.ACTIVE)

2. Guest submits order (Checkout)
   └─> Order created (OrderStatus.PENDING)
   └─> Cart cleared

3. Waiter reviews and accepts order
   └─> Order status: ACCEPTED
   └─> Waiter sends to kitchen

4. Kitchen prepares food
   └─> Order status: IN_KITCHEN → PREPARING → READY

5. Waiter serves food
   └─> Order status: SERVED
   └─> Guest can now request bill

6. Guest requests bill
   ├─> POST /api/sessions/{id}/request-bill
   └─> Session status: BILL_REQUESTED

7. Guest previews bill
   ├─> GET /api/sessions/{id}/bill-preview
   └─> Returns itemized bill with totals

8. Guest initiates Momo payment
   ├─> POST /api/payments/momo/initiate
   ├─> Body: { sessionId, returnUrl }
   │
   ├─> System generates unique orderId (PAY-YYYYMMDD-XXX)
   ├─> System calls Momo API with payment details
   │
   └─> Momo returns:
       ├─> payUrl (QR code URL for scanning)
       ├─> deeplink (momo://app deep link)
       ├─> qrCodeUrl (direct QR image)
       └─> requestId (tracking ID)

9. System saves Payment record
   ├─> method: MOMO
   ├─> status: PROCESSING
   ├─> gatewayRequestId: Momo's requestId
   ├─> qrCodeUrl: Momo's QR URL
   ├─> deepLink: Momo's deep link
   └─> Session status: PAYMENT_PENDING

10. Frontend displays payment options
    ├─> Option 1: Show QR code for scanning
    ├─> Option 2: Deep link button (opens Momo app)
    └─> Guest completes payment in Momo app

11. Momo processes payment
    └─> Sends IPN callback to our server

12. IPN Callback received
    ├─> POST /api/payments/momo/callback (from Momo servers)
    ├─> Payload: { orderId, requestId, transId, resultCode, ... }
    │
    ├─> System verifies signature (security)
    ├─> System validates resultCode:
    │   ├─> 0 = Success
    │   └─> Other = Failed
    │
    └─> System updates Payment:
        ├─> status: COMPLETED (if success) or FAILED
        ├─> gatewayTransactionId: Momo's transId
        ├─> gatewayResponse: Full JSON response
        ├─> gatewayCallbackAt: Current timestamp
        └─> paidAt: Current timestamp (if success)

13. If payment successful
    ├─> Session status: COMPLETED
    ├─> Session endedAt: Current timestamp
    └─> Guest redirected to success page

14. If payment failed
    ├─> Session status: BILL_REQUESTED (revert)
    ├─> Guest can retry payment
    └─> Payment record kept for audit
```

### 5.3 Momo API Integration

#### Required Dependencies (pom.xml):

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.12.0</version>
</dependency>
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
<dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
    <version>1.16.0</version>
</dependency>
```

#### Environment Configuration:

```properties
# application.properties or application.yml

# Momo Credentials (TEST environment)
momo.partner-code=MOMOBKUN20180529
momo.access-key=klm05TvNBzhg7h7j
momo.secret-key=at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa

# Momo Endpoints
momo.endpoint=https://test-payment.momo.vn/v2/gateway/api/create
momo.query-endpoint=https://test-payment.momo.vn/v2/gateway/api/query

# Application URLs
momo.redirect-url=${app.frontend-url}/payment/result
momo.ipn-url=${app.backend-url}/api/payments/momo/callback

# Payment Settings
momo.request-type=captureWallet
momo.auto-capture=true
momo.lang=en

# Production: Replace with production credentials
# momo.endpoint=https://payment.momo.vn/v2/gateway/api/create
# momo.partner-code=YOUR_PROD_PARTNER_CODE
# momo.access-key=YOUR_PROD_ACCESS_KEY
# momo.secret-key=YOUR_PROD_SECRET_KEY
```

#### Signature Generation (HMAC SHA256):

```java
// MomoSecurityUtil.java
public class MomoSecurityUtil {

    public static String signHmacSHA256(String data, String secretKey) {
        try {
            Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            hmacSHA256.init(secretKeySpec);
            byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Hex.encodeHexString(hash); // Apache Commons Codec
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }

    public static boolean verifySignature(
            String rawData,
            String signature,
            String secretKey) {
        String expectedSignature = signHmacSHA256(rawData, secretKey);
        return signature.equals(expectedSignature);
    }
}
```

#### Request Payload Format:

```java
// Create Payment Request to Momo
{
    "partnerCode": "MOMOBKUN20180529",
    "partnerName": "Smart Restaurant",
    "storeId": "SmartRestaurant01",
    "requestId": "PAY-20260226-001",
    "amount": 150000,
    "orderId": "ORD-20260226-001",
    "orderInfo": "Payment for Order ORD-20260226-001",
    "redirectUrl": "https://your-app.com/payment/result",
    "ipnUrl": "https://your-backend.com/api/payments/momo/callback",
    "lang": "en",
    "requestType": "captureWallet",
    "autoCapture": true,
    "extraData": "{\"sessionId\":\"uuid\"}",
    "signature": "computed_hmac_sha256_signature"
}

// Signature raw data (fields sorted alphabetically):
// "accessKey=xxx&amount=150000&extraData=...&ipnUrl=...&orderId=...&orderInfo=...&partnerCode=...&redirectUrl=...&requestId=...&requestType=captureWallet"
```

#### Momo Response Format:

```json
// Success Response
{
    "partnerCode": "MOMOBKUN20180529",
    "orderId": "ORD-20260226-001",
    "requestId": "PAY-20260226-001",
    "amount": 150000,
    "responseTime": 1708934400000,
    "message": "Successful",
    "resultCode": 0,
    "payUrl": "https://test-payment.momo.vn/v2/gateway/pay?t=xxx",
    "deeplink": "momo://app?action=pay&orderId=xxx",
    "qrCodeUrl": "https://test-payment.momo.vn/qr/xxx.png",
    "deeplinkMiniApp": "momo://app/miniapp?..."
}

// Error Response
{
    "partnerCode": "MOMOBKUN20180529",
    "orderId": "ORD-20260226-001",
    "requestId": "PAY-20260226-001",
    "amount": 150000,
    "responseTime": 1708934400000,
    "message": "Invalid signature",
    "resultCode": 4,
    "payUrl": "",
    "deeplink": "",
    "qrCodeUrl": ""
}
```

#### IPN Callback Format:

```json
// Momo sends this to your ipnUrl
{
    "partnerCode": "MOMOBKUN20180529",
    "orderId": "ORD-20260226-001",
    "requestId": "PAY-20260226-001",
    "amount": 150000,
    "orderInfo": "Payment for Order ORD-20260226-001",
    "orderType": "momo_wallet",
    "transId": 2889368183,
    "resultCode": 0,
    "message": "Successful",
    "payType": "qr",
    "responseTime": 1708934500000,
    "extraData": "{\"sessionId\":\"uuid\"}",
    "signature": "momo_computed_signature"
}

// ResultCode meanings:
// 0: Success
// 9000: Transaction pending
// 1006: Transaction failed
// 1001: Transaction rejected by user
// Other: Various error codes (check Momo docs)
```

### 5.4 API Endpoints

#### Payment Endpoints:

| Method | Endpoint                         | Description                          | Access |
| :----- | :------------------------------- | :----------------------------------- | :----- |
| POST   | `/api/payments/momo/initiate`    | Initiate Momo payment                | Public |
| POST   | `/api/payments/momo/callback`    | IPN callback from Momo (server-side) | Public |
| GET    | `/api/payments/momo/{id}/status` | Check payment status                 | Public |
| POST   | `/api/payments/momo/{id}/verify` | Manual verification (admin)          | ADMIN  |

#### Session Payment Endpoints:

| Method | Endpoint                          | Description            | Access |
| :----- | :-------------------------------- | :--------------------- | :----- |
| POST   | `/api/sessions/{id}/request-bill` | Request bill           | Public |
| GET    | `/api/sessions/{id}/bill-preview` | Preview bill breakdown | Public |
| POST   | `/api/admin/sessions/{id}/close`  | Close session manually | ADMIN  |

### 5.5 Result Codes

#### Common Momo Result Codes:

| Code | Meaning                 | Action                          |
| :--- | :---------------------- | :------------------------------ |
| 0    | Success                 | Complete payment, close session |
| 9000 | Pending                 | Wait for final status           |
| 1001 | User rejected           | Allow retry                     |
| 1006 | Transaction failed      | Allow retry                     |
| 4    | Invalid signature       | Log error, alert admin          |
| 10   | System error            | Retry or contact Momo           |
| 11   | Invalid access key      | Check credentials               |
| 20   | Invalid amount          | Verify amount format            |
| 21   | Order already confirmed | Check duplicate                 |
| 22   | Order not found         | Verify orderId                  |

Full list: https://developers.momo.vn/v3/docs/payment/api/result-handling/resultcode

### 5.6 Security Considerations

#### Best Practices:

1. **Signature Verification**: Always verify Momo's signature on IPN callbacks
2. **HTTPS Only**: IPN callback URL must use HTTPS in production
3. **Idempotency**: Handle duplicate IPN callbacks (check if payment already processed)
4. **Amount Validation**: Verify amount in callback matches original request
5. **Secret Key Protection**: Store secret key in environment variables, never commit to code
6. **Timeout Handling**: Set payment expiration time (default 15 minutes)
7. **Logging**: Log all Momo API interactions for debugging and auditing
8. **Error Handling**: Return 200 OK to Momo even on errors (prevents retry spam)

#### Sample Security Implementation:

```java
// PaymentService.java - IPN Handler
@Transactional
public MomoCallbackResponse handleCallback(MomoCallbackRequest request) {
    try {
        // 1. Verify signature
        String rawSignature = buildRawSignature(request);
        if (!MomoSecurityUtil.verifySignature(
                rawSignature,
                request.getSignature(),
                momoSecretKey)) {
            log.error("Invalid Momo signature for orderId: {}", request.getOrderId());
            return MomoCallbackResponse.error("Invalid signature");
        }

        // 2. Find payment record
        Payment payment = paymentRepo.findByGatewayRequestId(request.getRequestId())
            .orElseThrow(() -> new RuntimeException("Payment not found"));

        // 3. Check if already processed (idempotency)
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.warn("Payment already processed: {}", payment.getId());
            return MomoCallbackResponse.success("Already processed");
        }

        // 4. Verify amount matches
        if (!payment.getTotalAmount().equals(request.getAmount())) {
            log.error("Amount mismatch - Expected: {}, Got: {}",
                payment.getTotalAmount(), request.getAmount());
            payment.setStatus(PaymentStatus.FAILED);
            return MomoCallbackResponse.error("Amount mismatch");
        }

        // 5. Process based on result code
        if (request.getResultCode() == 0) {
            // Success
            completePayment(payment, request);
        } else {
            // Failed
            failPayment(payment, request);
        }

        return MomoCallbackResponse.success("Processed");

    } catch (Exception e) {
        log.error("Error processing Momo callback", e);
        return MomoCallbackResponse.error("Internal error");
    }
}
```

### 5.7 Testing

#### Test Credentials (Momo Test Environment):

```
Partner Code: MOMOBKUN20180529
Access Key: klm05TvNBzhg7h7j
Secret Key: at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa
Endpoint: https://test-payment.momo.vn/v2/gateway/api/create
```

#### Test Momo Account:

- Download Momo app (Android/iOS)
- Register test account
- Use test environment QR codes for payment
- Test transactions are free (no real money)

#### Postman Collection:

Import Momo's official Postman collection:
https://developers.momo.vn/v3/docs/payment/api/wallet/onetime

### 5.8 Production Checklist

- [ ] Replace test credentials with production credentials
- [ ] Update endpoints to production URLs
- [ ] Configure HTTPS for IPN callback URL
- [ ] Set up monitoring and alerting for payment failures
- [ ] Implement payment reconciliation (daily batch job)
- [ ] Test payment flows end-to-end
- [ ] Document rollback procedures
- [ ] Set up error notification to admin
- [ ] Configure payment timeout (default: 15 minutes)
- [ ] Test webhook retry mechanism

---

## 6. File Structure

```
src/main/java/com/example/RestaurantBackend/
├── model/
│   ├── SessionStatus.java          (new)
│   ├── OrderStatus.java            (new)
│   ├── OrderItemStatus.java        (new)
│   ├── PaymentMethod.java          (new)
│   ├── PaymentStatus.java          (new)
│   ├── Session.java                (new)
│   ├── CartItem.java               (new)
│   ├── CartItemModifier.java       (new)
│   ├── Order.java                  (new)
│   ├── OrderItem.java              (new)
│   ├── OrderItemModifier.java      (new)
│   ├── Payment.java                (new)
│   └── TableAssignment.java        (new)
├── repo/
│   ├── SessionRepo.java            (new)
│   ├── CartItemRepo.java           (new)
│   ├── OrderRepo.java              (new)
│   ├── OrderItemRepo.java          (new)
│   ├── PaymentRepo.java            (new)
│   └── TableAssignmentRepo.java    (new)
├── dto/
│   ├── request/
│   │   ├── session/
│   │   │   └── StartSessionRequest.java
│   │   ├── cart/
│   │   │   ├── AddCartItemRequest.java
│   │   │   └── UpdateCartItemRequest.java
│   │   ├── order/
│   │   │   ├── CheckoutRequest.java
│   │   │   ├── UpdateOrderStatusRequest.java
│   │   │   └── RejectItemRequest.java
│   │   ├── payment/
│   │   │   └── ProcessPaymentRequest.java
│   │   └── waiter/
│   │       └── AssignTableRequest.java
│   └── response/
│       ├── SessionResponse.java
│       ├── CartItemResponse.java
│       ├── OrderResponse.java
│       ├── OrderItemResponse.java
│       ├── OrderListResponse.java
│       ├── KdsOrderResponse.java
│       ├── KdsStatsResponse.java
│       ├── WaiterTableResponse.java
│       ├── PendingOrderResponse.java
│       ├── BillPreviewResponse.java
│       ├── BillRequestResponse.java
│       └── PaymentResponse.java
├── service/
│   ├── SessionService.java         (new)
│   ├── OrderService.java           (new)
│   ├── KitchenService.java         (new)
│   ├── WaiterService.java          (new)
│   ├── BillService.java            (new)
│   ├── PaymentService.java         (new)
│   └── TableAssignmentService.java (new)
└── controller/
    ├── SessionController.java      (new)
    ├── KitchenController.java      (new)
    └── WaiterController.java       (new)
```

---

## 7. Verification

### Test Scenarios

**Session Flow:**

1. Scan QR → Start session → Verify session created
2. Add items to cart → Verify cart state
3. Update cart item → Verify changes
4. Remove cart item → Verify removal
5. Checkout → Verify order created, cart cleared

**Waiter Flow:**

1. Get pending orders → Verify filtering
2. Accept item → Verify status change
3. Reject item with reason → Verify reason stored
4. Send to kitchen → Verify order appears in KDS

**Kitchen Flow:**

1. Get KDS orders → Verify sorted by time
2. Filter by status → Verify filtering works
3. Update status through states → Verify state machine
4. Check overdue alerts → Verify timer logic

**Payment Flow:**

1. Preview bill → Verify calculations
2. Request bill → Verify session status change
3. Process payment → Verify payment record
4. Close session → Verify session completed

---

## 8. Key Decisions

| Decision           | Choice                | Rationale                                                  |
| ------------------ | --------------------- | ---------------------------------------------------------- |
| Cart storage       | Database (CartItem)   | Persists across browser refresh, supports multiple devices |
| Order numbers      | ORD-YYYYMMDD-XXX      | Human-readable, date-based for easy identification         |
| Price snapshots    | Store at order time   | Preserve historical accuracy if menu prices change         |
| Modifier storage   | Separate tables       | Normalized, queryable, maintains relationships             |
| Payment gateway    | Interface-based       | Easy to swap implementations (Cash → Momo → others)        |
| Session validation | QR token + session ID | Double verification for security                           |
| Waiter assignment  | Separate table        | Track history, support shift changes                       |
