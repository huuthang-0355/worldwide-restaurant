package com.example.RestaurantBackend.dto.response.pending_order;

import com.example.RestaurantBackend.dto.response.order.OrderItemResponse;
import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.order.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingOrderResponse {

    private UUID orderId;
    private String orderNumber;
    private UUID tableId;
    private String tableNumber;
    private OrderStatus orderStatus;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private Integer pendingItemsCount;

    public static PendingOrderResponse fromEntity(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() == null
                ? List.of()
                : order.getItems().stream()
                .map(OrderItemResponse::fromEntity)
                .toList();

        long pendingCounts = order.getItems().stream()
                .filter(item -> item.getStatus() == OrderItemStatus.PENDING)
                .count();

        return PendingOrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .orderStatus(order.getStatus())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .specialInstructions(order.getSpecialInstructions())
                .createdAt(order.getCreatedAt())
                .pendingItemsCount((int) pendingCounts)
                .build();
    }
}
