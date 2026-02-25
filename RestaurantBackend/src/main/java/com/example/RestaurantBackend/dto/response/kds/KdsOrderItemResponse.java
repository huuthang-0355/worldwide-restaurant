package com.example.RestaurantBackend.dto.response.kds;


import com.example.RestaurantBackend.dto.response.order.OrderItemModifierResponse;
import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.order.OrderItem;
import com.example.RestaurantBackend.model.order.OrderItemModifier;
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
public class KdsOrderItemResponse {

    private UUID id;
    private UUID menuItemId;
    private String menuItemName;
    private Integer quantity;
    private OrderItemStatus status;
    private String specialInstructions;
    private Integer prepTimeMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<OrderItemModifierResponse> selectedModifiers;

    private Boolean isOverdue;
    private Integer overdueMinutes;
    private Integer elapsedMinutes;

    public static KdsOrderItemResponse fromEntity(OrderItem item) {
        List<OrderItemModifierResponse> orderItemModifierList = item.getSelectedModifiers() == null
                ? List.of()
                : item.getSelectedModifiers().stream()
                .map(OrderItemModifierResponse::fromEntity)
                .toList();

        // calculate elapsed time and overdue status
        LocalDateTime referenceTime = item.getStartedAt() != null
                ? item.getStartedAt() : item.getCompletedAt();

        int elapsedMinutes = 0;
        boolean isOverdue = false;
        int overdueMinutes = 0;

        if(referenceTime != null && item.getCompletedAt() == null) {
            Duration elapsed = Duration.between(referenceTime, LocalDateTime.now());
            elapsedMinutes = (int) elapsed.toMinutes();

            if(item.getPrepTimeMinutes() != null) {
                if(elapsedMinutes > item.getPrepTimeMinutes()) {
                    isOverdue = true;
                    overdueMinutes = elapsedMinutes - item.getPrepTimeMinutes();
                }
            }
        }

        return KdsOrderItemResponse.builder()
                .menuItemId(item.getMenuItem().getId())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .status(item.getStatus())
                .specialInstructions(item.getSpecialInstructions())
                .prepTimeMinutes(item.getPrepTimeMinutes())
                .startedAt(item.getStartedAt())
                .completedAt(item.getCompletedAt())
                .selectedModifiers(orderItemModifierList)
                .elapsedMinutes(elapsedMinutes)
                .isOverdue(isOverdue)
                .overdueMinutes(overdueMinutes)
                .build();

    }
}
