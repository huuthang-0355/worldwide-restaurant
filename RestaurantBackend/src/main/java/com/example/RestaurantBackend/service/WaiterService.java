package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.RejectItemRequest;
import com.example.RestaurantBackend.dto.response.bill_request.BillRequestListResponse;
import com.example.RestaurantBackend.dto.response.bill_request.BillRequestResponse;
import com.example.RestaurantBackend.dto.response.order.OrderResponse;
import com.example.RestaurantBackend.dto.response.pending_order.PendingOrderListResponse;
import com.example.RestaurantBackend.dto.response.pending_order.PendingOrderResponse;
import com.example.RestaurantBackend.model.Session;
import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import com.example.RestaurantBackend.model.order.Order;
import com.example.RestaurantBackend.model.order.OrderItem;
import com.example.RestaurantBackend.repo.OrderItemRepo;
import com.example.RestaurantBackend.repo.OrderRepo;
import com.example.RestaurantBackend.repo.SessionRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WaiterService {

    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final SessionRepo sessionRepo;

    @Transactional
    public PendingOrderListResponse getPendingOrders() {
        List<Order> orders = orderRepo.findByStatusInOrderByCreatedAtAsc(
                List.of(OrderStatus.PENDING)
        );

        List<PendingOrderResponse> pendingOrders = orders == null
                ? List.of()
                : orders.stream()
                .map(PendingOrderResponse::fromEntity)
                .toList();

        return PendingOrderListResponse.success(pendingOrders);
    }

    // accept order item and check if all items are processed (ACCEPTED OR REJECTED)
    // -> update order status. If it has at least one ACCEPTED -> order status = ACCEPTED
    // If it has no one ACCEPTED -> order status = REJECTED
    @Transactional
    public OrderResponse acceptOrderItem(UUID orderId, UUID itemId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if(order.getStatus() != OrderStatus.PENDING)
            return OrderResponse.error("Order is not in PENDING status");

        OrderItem orderItem = orderItemRepo.findByIdAndOrderId(itemId, orderId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        if(orderItem.getStatus() != OrderItemStatus.PENDING)
            return OrderResponse.error("Item is not in PENDING status");

        // update status item to ACCEPTED
        orderItem.setStatus(OrderItemStatus.ACCEPTED);
        orderItemRepo.save(orderItem);

        // check if all items are accepted or rejected
        boolean allProcessed = order.getItems().stream()
                .allMatch(item -> item.getStatus() == OrderItemStatus.ACCEPTED ||
                        item.getStatus() == OrderItemStatus.REJECTED);

        if(allProcessed) {
            // check if at least one item is accepted
            boolean hasAccepted = order.getItems().stream()
                    .anyMatch(item -> item.getStatus() == OrderItemStatus.ACCEPTED);

            if(hasAccepted) {
                // update order status to ACCEPTED
                order.setStatus(OrderStatus.ACCEPTED);
                orderRepo.save(order);

            }else {
                // All items are rejected, CANCELLED ORDER
                order.setStatus(OrderStatus.CANCELLED);
                orderRepo.save(order);
            }
        }

        return OrderResponse.success(order);
    }

    @Transactional
    public OrderResponse rejectOrderItem(UUID orderId, UUID itemId,
                                         RejectItemRequest request) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            return OrderResponse.error("Order is not in PENDING status");
        }

        OrderItem item = orderItemRepo.findByIdAndOrderId(itemId, orderId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        if (item.getStatus() != OrderItemStatus.PENDING) {
            return OrderResponse.error("Item is not in PENDING status");
        }

        // update order item to REJECTED
        item.setStatus(OrderItemStatus.REJECTED);
        item.setRejectionReason(request.getReason());
        orderItemRepo.save(item);

        // Check if all items are processed
        boolean allProcessed = order.getItems().stream()
                .allMatch(i -> i.getStatus() == OrderItemStatus.ACCEPTED
                        || i.getStatus() == OrderItemStatus.REJECTED);

        if (allProcessed) {
            // Check if at least one item is accepted
            boolean hasAccepted = order.getItems().stream()
                    .anyMatch(i -> i.getStatus() == OrderItemStatus.ACCEPTED);

            if (hasAccepted) {
                order.setStatus(OrderStatus.ACCEPTED);
                orderRepo.save(order);
            } else {
                // All items rejected, cancel order
                order.setStatus(OrderStatus.CANCELLED);
                orderRepo.save(order);
            }
        }

        return OrderResponse.success(order);

    }

    @Transactional
    public OrderResponse sendToKitchen(UUID orderId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if(order.getStatus() != OrderStatus.ACCEPTED)
            return OrderResponse.error("Order must be ACCEPTED before sending to kitchen");

        // Update order status to IN_KITCHEN
        order.setStatus(OrderStatus.IN_KITCHEN);
        order.setSentToKitchenAt(LocalDateTime.now());

        // Update all ACCEPTED items to PREPARING status
        order.getItems().forEach(item -> {
            if(item.getStatus() == OrderItemStatus.ACCEPTED)
                item.setStatus(OrderItemStatus.PREPARING);
        });

        orderRepo.save(order);

        return OrderResponse.success(order);
    }

    @Transactional
    public OrderResponse markAsServed(UUID orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.READY) {
            return OrderResponse.error("Order must be READY before marking as served");
        }

        // Update order status to SERVED
        order.setStatus(OrderStatus.SERVED);
        order.setServedAt(LocalDateTime.now());

        // Update all ready items to SERVED status
        order.getItems().forEach(item -> {
            if (item.getStatus() == OrderItemStatus.READY) {
                item.setStatus(OrderItemStatus.SERVED);
            }
        });

        orderRepo.save(order);

        return OrderResponse.success(order);

    }

    @Transactional
    public BillRequestListResponse getBillRequests() {
        // get session with BILL_REQUESTED status
        List<Session> billRequestedSessions = sessionRepo.findByStatusOrderByUpdatedAtAsc(
                SessionStatus.BILL_REQUESTED
        );

        List<BillRequestResponse> responses = billRequestedSessions.stream()
                .map(BillRequestResponse::fromEntity)
                .toList();

        return BillRequestListResponse.success(responses);
    }



}
