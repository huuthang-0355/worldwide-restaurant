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

### Phase 5: Bill & Payment (Momo-Ready)

**Step 5.1: Create Payment DTOs**

- `dto/request/payment/ProcessPaymentRequest.java` - method, notes
- `dto/response/BillPreviewResponse.java` - Itemized bill
- `dto/response/PaymentResponse.java` - Payment confirmation
- `dto/response/MomoPaymentResponse.java` - QR code, deep link (future)

**Step 5.2: Create Bill Service**

- Create `service/BillService.java`
    - `previewBill()` - Calculate totals, taxes, service charge
    - `requestBill()` - Update session status, notify waiter
    - `generateBillPdf()` - Optional PDF generation

**Step 5.3: Create Payment Service (Momo-Ready)**

- Create `service/PaymentService.java`
    - `initiatePayment()` - Create payment record
    - `processPayment()` - Handle payment completion
    - `closeSession()` - Mark session as COMPLETED

    // Future Momo methods (interface-ready)
    - `initiateMomoPayment()` - Call Momo API, get QR
    - `handleMomoCallback()` - Process Momo IPN callback
    - `checkMomoStatus()` - Query payment status

**Step 5.4: Payment Gateway Interface (For Future)**

```java
public interface PaymentGateway {
    PaymentInitResponse initiate(PaymentRequest request);
    PaymentStatusResponse checkStatus(String transactionId);
    void handleCallback(String payload, String signature);
}
```

---

### Phase 6: Security Configuration Updates

**Step 6.1: Update SecurityConfig.java**

```java
// Add to public endpoints
"/api/sessions/**"  // Guest session management (validated by QR token)

// Add role-based endpoints
.requestMatchers("/api/kitchen/**").hasRole("KITCHEN_STAFF")
.requestMatchers("/api/waiter/**").hasRole("WAITER")
```

**Step 6.2: Session Token Validation**

- Reuse `QrTokenService.validateToken()` for session endpoints
- Add session ID validation to ensure guest owns the session

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

## 5. Momo Integration Architecture (Future)

### 5.1 Flow Design

```
1. Guest requests bill → Session.status = BILL_REQUESTED
2. Guest selects "Pay with Momo" → Call Momo API
3. System creates Payment with:
   - method = MOMO
   - status = PROCESSING
   - gatewayRequestId = our unique ID
4. Momo returns QR code URL and deep link
5. Guest scans QR or opens Momo app
6. Momo sends IPN callback to our endpoint
7. System verifies signature, updates Payment:
   - status = COMPLETED
   - gatewayTransactionId = Momo's ID
8. Close session
```

### 5.2 Required Endpoints (Future)

```
POST /api/payments/momo/initiate     → Create Momo payment request
POST /api/payments/momo/callback     → IPN callback (from Momo)
GET  /api/payments/momo/{id}/status  → Check payment status
```

### 5.3 Environment Variables (Future)

```properties
momo.partner-code=PARTNER_CODE
momo.access-key=ACCESS_KEY
momo.secret-key=SECRET_KEY
momo.endpoint=https://test-payment.momo.vn/v2/gateway/api
momo.callback-url=${app.backend-url}/api/payments/momo/callback
momo.return-url=${app.frontend-url}/payment/result
```

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
