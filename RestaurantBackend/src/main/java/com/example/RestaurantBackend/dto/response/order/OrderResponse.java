package com.example.RestaurantBackend.dto.response.order;

import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.order.Order;
import com.example.RestaurantBackend.model.order.OrderItem;
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
public class OrderResponse {

    private boolean success;
    private String message;
    private UUID orderId;
    private String orderNumber;
    private UUID tableId;
    private String tableNumber;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String specialInstructions;
    private Integer estimatedPrepTime;
    private LocalDateTime sentToKitchenAt;
    private LocalDateTime readyAt;
    private LocalDateTime servedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    public static OrderResponse fromEntity(Order order) {
        List<OrderItemResponse> items = order.getItems() == null
                ? List.of()
                : order.getItems().stream()
                    .map(OrderItemResponse::fromEntity)
                    .toList();

        return OrderResponse.builder()
                .success(true)
                .message("Order retrieved successfully")
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .status(order.getStatus())
                .items(items)
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .specialInstructions(order.getSpecialInstructions())
                .estimatedPrepTime(order.getEstimatedPrepTime())
                .sentToKitchenAt(order.getSentToKitchenAt())
                .readyAt(order.getReadyAt())
                .servedAt(order.getServedAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public static OrderResponse success(Order order) {

        return OrderResponse.fromEntity(order);
    }

    public static OrderResponse error(String message) {

        return OrderResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

}
