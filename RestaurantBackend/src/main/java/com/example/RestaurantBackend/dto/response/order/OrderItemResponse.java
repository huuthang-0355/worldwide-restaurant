package com.example.RestaurantBackend.dto.response.order;

import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.order.OrderItem;
import com.example.RestaurantBackend.model.order.OrderItemModifier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private UUID id;
    private UUID menuItemId;
    private String menuItemName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal modifiersPrice;
    private BigDecimal lineTotal;
    private OrderItemStatus status;
    private String specialInstructions;
    private String rejectionReason;
    private Integer prepTimeMinutes;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<OrderItemModifierResponse> selectedModifiers;
    private LocalDateTime createdAt;

    public static OrderItemResponse fromEntity(OrderItem item) {
        List<OrderItemModifierResponse> modifiers = item.getSelectedModifiers() == null
                ? List.of()
                : item.getSelectedModifiers().stream()
                .map(OrderItemModifierResponse::fromEntity)
                .toList();

        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem().getId())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .modifiersPrice(item.getModifiersPrice())
                .lineTotal(item.getLineTotal())
                .status(item.getStatus())
                .specialInstructions(item.getSpecialInstructions())
                .rejectionReason(item.getRejectionReason())
                .prepTimeMinutes(item.getPrepTimeMinutes())
                .startedAt(item.getStartedAt())
                .completedAt(item.getCompletedAt())
                .selectedModifiers(modifiers)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
