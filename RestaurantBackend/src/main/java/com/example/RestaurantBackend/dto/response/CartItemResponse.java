package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.CartItem;
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
public class CartItemResponse {

    private UUID id;
    private UUID menuItemId;
    private String menuItemName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal modifiersPrice;
    private BigDecimal lineTotal;
    private String specialInstructions;
    private List<CartItemModifierResponse> selectedModifiers;
    private LocalDateTime createdAt;

    public static CartItemResponse fromEntity(CartItem cartItem) {
        BigDecimal lineTotal = cartItem.getUnitPrice()
                .add(cartItem.getModifiersPrice())
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        List<CartItemModifierResponse> modifiers = cartItem.getSelectedModifiers() == null ?
                List.of() :
                cartItem.getSelectedModifiers().stream()
                        .map(CartItemModifierResponse::fromEntity)
                        .toList();

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .menuItemId(cartItem.getMenuItem().getId())
                .menuItemName(cartItem.getMenuItem().getName())
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .modifiersPrice(cartItem.getModifiersPrice())
                .lineTotal(lineTotal)
                .specialInstructions(cartItem.getSpecialInstructions())
                .selectedModifiers(modifiers)
                .createdAt(cartItem.getCreatedAt())
                .build();
    }

}
