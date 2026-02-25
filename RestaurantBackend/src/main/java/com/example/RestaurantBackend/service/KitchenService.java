package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.UpdateOrderStatusRequest;
import com.example.RestaurantBackend.dto.response.kds.KdsOrderListResponse;
import com.example.RestaurantBackend.dto.response.kds.KdsOrderResponse;
import com.example.RestaurantBackend.dto.response.kds.KdsStatsResponse;
import com.example.RestaurantBackend.dto.response.order.OrderResponse;
import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.order.Order;
import com.example.RestaurantBackend.repo.OrderRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final OrderRepo orderRepo;
    private final OrderService orderService;

    @Transactional
    public KdsOrderListResponse getKitchenOrders(OrderStatus status) {
        List<OrderStatus> kitchenStatuses;

        if(status != null) {
            kitchenStatuses = List.of(status);
        }else {
            // get all active kitchen orders
            kitchenStatuses = Arrays.asList(
                    OrderStatus.IN_KITCHEN,
                    OrderStatus.PREPARING,
                    OrderStatus.READY
            );
        }

        List<Order> orders =  orderRepo.findByStatusInOrderByCreatedAtAsc(kitchenStatuses);

        List<KdsOrderResponse> kdsOrderResponseList = orders.stream()
                .map(KdsOrderResponse::fromEntity)
                .toList();

        return KdsOrderListResponse.success(kdsOrderResponseList);
    }

    @Transactional
    public KdsOrderResponse getKitchenOrderById(UUID orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return KdsOrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, UpdateOrderStatusRequest request) {
        // update status through OrderService
        OrderResponse response = orderService.updateOrderStatus(orderId, request.getStatus());

        if(!response.isSuccess())
            return response;

        // update timestamp based on staus change
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        switch (request.getStatus()) {
            case PREPARING -> {
                if(order.getSentToKitchenAt() == null)
                    order.setSentToKitchenAt(LocalDateTime.now());

                // update all order items to PREPARING and set startedAt
                order.getItems()
                        .forEach(item -> {
                            item.setStatus(OrderItemStatus.PREPARING);

                            if(item.getStartedAt() == null)
                                item.setStartedAt(LocalDateTime.now());
                        });
            }
            case READY -> {
                if(order.getReadyAt() == null)
                    order.setReadyAt(LocalDateTime.now());

                // update all order items to READY and set completed
                order.getItems().forEach(item -> {
                    item.setStatus(OrderItemStatus.READY);

                    if(item.getCompletedAt() == null) item.setCompletedAt(LocalDateTime.now());
                });
            }
        }

        orderRepo.save(order);

        return OrderResponse.success(order);
    }

    @Transactional
    public KdsStatsResponse getOrderStats() {
        long receivedCount = orderRepo.countByStatus(OrderStatus.ACCEPTED);
        long preparingCount = orderRepo.countByStatusIn(
                Arrays.asList(
                        OrderStatus.IN_KITCHEN,
                        OrderStatus.PREPARING
                )
        );
        long readyCount = orderRepo.countByStatus(OrderStatus.READY);
        long completedCount = orderRepo.countByStatusIn(
                Arrays.asList(
                        OrderStatus.COMPLETED,
                        OrderStatus.SERVED
                )
        );

        List<Order> activeOrders = orderRepo.findByStatusInOrderByCreatedAtAsc(
                Arrays.asList(
                        OrderStatus.IN_KITCHEN,
                        OrderStatus.PREPARING,
                        OrderStatus.READY
                )
        );

        long overdueCount = activeOrders.stream()
                .filter(this::isOrderOverdue)
                .count();

        return KdsStatsResponse.success(
                receivedCount,
                preparingCount,
                readyCount,
                completedCount,
                overdueCount
        );

    }

    private boolean isOrderOverdue(Order order) {
        if(order.getEstimatedPrepTime() == null) return false;

        if(order.getReadyAt() != null) return false;

        LocalDateTime referenceTime = order.getSentToKitchenAt() != null
                ? order.getSentToKitchenAt()
                : order.getCreatedAt();

        if(referenceTime == null) return false;

        Duration elapsed = Duration.between(referenceTime, LocalDateTime.now());
        return elapsed.toMinutes() > order.getEstimatedPrepTime();
    }
}
