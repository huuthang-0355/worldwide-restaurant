package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.CheckoutRequest;
import com.example.RestaurantBackend.dto.response.order.OrderListResponse;
import com.example.RestaurantBackend.dto.response.order.OrderResponse;
import com.example.RestaurantBackend.model.CartItem;
import com.example.RestaurantBackend.model.CartItemModifier;
import com.example.RestaurantBackend.model.Session;
import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import com.example.RestaurantBackend.model.order.Order;
import com.example.RestaurantBackend.model.order.OrderItem;
import com.example.RestaurantBackend.model.order.OrderItemModifier;
import com.example.RestaurantBackend.repo.CartItemRepo;
import com.example.RestaurantBackend.repo.OrderItemRepo;
import com.example.RestaurantBackend.repo.OrderRepo;
import com.example.RestaurantBackend.repo.SessionRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final SessionRepo sessionRepo;
    private final CartItemRepo cartItemRepo;
    private final OrderRepo orderRepo;

    private String generateOrderNumber() {
        // format: ORD-YYYYMMDD-XX
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "ORD-" + dateStr + "-";

        int sequence = 1;
        String orderNumber;

        do {
            orderNumber = prefix + String.format("%03d", sequence);
            sequence++;
        } while (orderRepo.existsByOrderNumber(orderNumber));

        return orderNumber;

}
    private boolean isValidStatusTransition(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case PENDING -> next == OrderStatus.ACCEPTED || next == OrderStatus.CANCELLED;
            case ACCEPTED -> next == OrderStatus.IN_KITCHEN || next == OrderStatus.CANCELLED;
            case IN_KITCHEN -> next == OrderStatus.PREPARING || next == OrderStatus.CANCELLED;
            case PREPARING -> next == OrderStatus.READY || next == OrderStatus.CANCELLED;
            case READY -> next == OrderStatus.SERVED || next == OrderStatus.CANCELLED;
            case SERVED -> next == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };

    }

    // convert cart item into order item
    @Transactional
    public OrderResponse checkout(UUID sessionId, CheckoutRequest request) {

        // validate session id
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if(session.getStatus() != SessionStatus.ACTIVE)
            return OrderResponse.error("Session is not ACTIVE");

        // get cart items
        List<CartItem> cartItems = cartItemRepo.findBySessionIdOrderByCreatedAtAsc(sessionId);

        if(cartItems.isEmpty())
            return OrderResponse.error("Cart is empty");

        // generate order number
        String orderNumber = this.generateOrderNumber();

        // calculate total and prepTimes
        BigDecimal subtotal = BigDecimal.ZERO;
        int estimatedPrepTime = 0;

        List<OrderItem> orderItemList = new ArrayList<>();

        for(CartItem cartItem : cartItems) {
            // calculate subtotal
            BigDecimal itemSubtotal = cartItem.getUnitPrice()
                    .add(cartItem.getModifiersPrice())
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            subtotal = subtotal.add(itemSubtotal);

            // track max prep time
            Integer itemPrepTime = cartItem.getMenuItem().getPrepTimeMinutes();
            if(itemPrepTime != null && itemPrepTime > estimatedPrepTime)
                estimatedPrepTime = itemPrepTime;

            // create order item
            OrderItem orderItem = OrderItem.builder()
                    .order(null)
                    .menuItem(cartItem.getMenuItem())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .modifiersPrice(cartItem.getModifiersPrice())
                    .lineTotal(itemSubtotal)
                    .status(OrderItemStatus.PENDING)
                    .specialInstructions(cartItem.getSpecialInstructions())
                    .build();

            // copy modifiers from cart to orderItem
            for(CartItemModifier cartItemModifier : cartItem.getSelectedModifiers()) {
                OrderItemModifier orderItemModifier = OrderItemModifier.builder()
                        .orderItem(orderItem)
                        .modifierOption(cartItemModifier.getModifierOption())
                        .modifierName(cartItemModifier.getModifierGroupName())
                        .optionName(cartItemModifier.getOptionName())
                        .priceAdjustment(cartItemModifier.getPriceAdjustment())
                        .build();

                orderItem.getSelectedModifiers().add(orderItemModifier);
            }

            orderItemList.add(orderItem);
        }

        // calculate tax
        BigDecimal taxRate = new BigDecimal("0.10");
        BigDecimal taxAmount = subtotal.max(taxRate);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        // create order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .session(session)
                .table(session.getTable())
                .status(OrderStatus.PENDING)
                .items(orderItemList)
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .specialInstructions(request.getSpecialInstructions())
                .estimatedPrepTime(estimatedPrepTime)
                .build();

        // set order reference for each order item
        orderItemList.forEach(orderItem -> orderItem.setOrder(order));

        // save order
        orderRepo.save(order);

        // clear cart
        cartItemRepo.deleteBySessionId(sessionId);

        return OrderResponse.success(order);
    }

    @Transactional
    public OrderListResponse getOrdersBySessionId(UUID sessionId) {
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Order> orders = orderRepo.findBySessionIdOrderByCreatedAtDesc(sessionId);

        List<OrderResponse> orderResponseList = orders.stream()
                .map(OrderResponse::fromEntity)
                .toList();

        return OrderListResponse.success(orderResponseList);
    }

    @Transactional
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return OrderResponse.success(order);
    }
    
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // validate state transition
        if(!this.isValidStatusTransition(order.getStatus(), newStatus))
            return OrderResponse.error("Invalid status transition from " + order.getStatus() + " to " + newStatus);

        order.setStatus(newStatus);

        // update timestamp based on status
        switch (newStatus) {
            case IN_KITCHEN -> order.setSentToKitchenAt(LocalDateTime.now());
            case READY -> order.setReadyAt(LocalDateTime.now());
            case SERVED -> order.setServedAt(LocalDateTime.now());
        }

        // update all oder items status accordingly
        this.updateOrderItemStatus(order, newStatus);

        order = orderRepo.save(order);

        return OrderResponse.success(order);
    }

    @Transactional
    public void updateOrderItemStatus(Order order, OrderStatus orderStatus) {
        OrderItemStatus itemStatus = switch (orderStatus) {
            case PENDING -> OrderItemStatus.PENDING;
            case ACCEPTED -> OrderItemStatus.ACCEPTED;
            case IN_KITCHEN, PREPARING -> OrderItemStatus.PREPARING;
            case READY -> OrderItemStatus.READY;
            case SERVED -> OrderItemStatus.SERVED;
            default -> null;
        };

        if(itemStatus != OrderItemStatus.REJECTED) {
            order.getItems().forEach(item -> {
                if(item.getStatus() != OrderItemStatus.REJECTED)
                    item.setStatus(itemStatus);

                if(item.getStatus() == OrderItemStatus.PREPARING && item.getStartedAt() == null)
                    item.setStartedAt(LocalDateTime.now());

                if(item.getStatus() == OrderItemStatus.READY && item.getCompletedAt() == null)
                    item.setCompletedAt(LocalDateTime.now());
            });
        }
    }

}
