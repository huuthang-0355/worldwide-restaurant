package com.example.RestaurantBackend.dto.response.kds;

import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.order.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsOrderResponse {

    private UUID orderId;
    private String orderNumber;
    private UUID tableId;
    private String tableNumber;
    private OrderStatus status;
    private List<KdsOrderItemResponse> items;
    private String specialInstructions;
    private Integer estimatedPrepTime;
    private LocalDateTime sentToKitchenAt;
    private LocalDateTime createdAt;


    private Integer totalItems;
    private Integer completedItems;
    private Integer elapsedMinutes;
    private Integer overdueMinutes;
    private Boolean isOverdue;

    public static KdsOrderResponse fromEntity(Order order) {
        List<KdsOrderItemResponse> items = order.getItems() == null
                ? List.of()
                : order.getItems().stream()
                .map(KdsOrderItemResponse::fromEntity)
                .toList();

        int totalItems = items.size();
        long completedItems = items.stream()
                .filter(item -> item.getStatus() == OrderItemStatus.READY ||
                        item.getStatus() == OrderItemStatus.SERVED)
                .count();

        // Calculate order-level elapsed time and overdue status
        LocalDateTime referenceTime = order.getSentToKitchenAt() != null
                ? order.getSentToKitchenAt()
                : order.getCreatedAt();

        int elapsedMinutes = 0;
        boolean isOverdue = false;
        int overdueMinutes = 0;

        if (referenceTime != null && order.getReadyAt() == null) {
            Duration elapsed = Duration.between(referenceTime, LocalDateTime.now());
            elapsedMinutes = (int) elapsed.toMinutes();

            if (order.getEstimatedPrepTime() != null) {
                if (elapsedMinutes > order.getEstimatedPrepTime()) {
                    isOverdue = true;
                    overdueMinutes = elapsedMinutes - order.getEstimatedPrepTime();
                }
            }
        }

        return KdsOrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .status(order.getStatus())
                .items(items)
                .specialInstructions(order.getSpecialInstructions())
                .estimatedPrepTime(order.getEstimatedPrepTime())
                .sentToKitchenAt(order.getSentToKitchenAt())
                .createdAt(order.getCreatedAt())
                .totalItems(totalItems)
                .completedItems((int) completedItems)
                .elapsedMinutes(elapsedMinutes)
                .isOverdue(isOverdue)
                .overdueMinutes(overdueMinutes)
                .build();
    }
}
