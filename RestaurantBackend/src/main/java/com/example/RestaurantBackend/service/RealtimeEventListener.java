package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.response.order.OrderResponse;
import com.example.RestaurantBackend.dto.response.payment.PaymentStatusResponse;
import com.example.RestaurantBackend.event.OrderCreatedEvent;
import com.example.RestaurantBackend.event.OrderStatusChangedEvent;
import com.example.RestaurantBackend.event.PaymentCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class RealtimeEventListener {

    private final RealtimeService realtimeService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Handling OrderCreatedEvent for order: {}", event.getOrder().getOrderNumber());
        try {
            OrderResponse response = OrderResponse.fromEntity(event.getOrder());
            realtimeService.broadcastToAdmins("new-order", response);
        } catch (Exception e) {
            log.error("Error broadcasting OrderCreatedEvent", e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("OrderStatusChangedEvent: order={} prevStatus={} newStatus={}",
                event.getOrder().getOrderNumber(), event.getPreviousStatus(), event.getNewStatus());
        try {
            OrderResponse response = OrderResponse.fromEntity(event.getOrder());
            
            // Notify admins (waiters, KDS)
            realtimeService.broadcastToAdmins("order-status-updated", response);

            // Notify specific customer session
            if (event.getOrder().getSession() != null) {
                realtimeService.broadcastToCustomerSession(
                        event.getOrder().getSession().getId(),
                        "order-status-updated",
                        response
                );
            }
        } catch (Exception e) {
            log.error("Error broadcasting OrderStatusChangedEvent", e);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Handling PaymentCompletedEvent for payment reference: {}", event.getPayment().getPaymentReference());
        try {
            PaymentStatusResponse response = PaymentStatusResponse.success(event.getPayment());
            
            // Notify admins/waiters
            realtimeService.broadcastToAdmins("payment-completed", response);

            // Notify customer session
            if (event.getPayment().getSession() != null) {
                realtimeService.broadcastToCustomerSession(
                        event.getPayment().getSession().getId(),
                        "payment-completed",
                        response
                );
            }
        } catch (Exception e) {
            log.error("Error broadcasting PaymentCompletedEvent", e);
        }
    }
}
