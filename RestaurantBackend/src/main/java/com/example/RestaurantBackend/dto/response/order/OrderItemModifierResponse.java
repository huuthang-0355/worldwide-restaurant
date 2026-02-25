package com.example.RestaurantBackend.dto.response.order;

import com.example.RestaurantBackend.model.order.OrderItemModifier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemModifierResponse {

    private UUID id;
    private UUID modifierOptionId;
    private String modifierName;
    private String optionName;
    private BigDecimal priceAdjustment;

    public static OrderItemModifierResponse fromEntity(OrderItemModifier modifier) {

        return OrderItemModifierResponse.builder()
                .id(modifier.getId())
                .modifierOptionId(modifier.getModifierOption().getId())
                .modifierName(modifier.getModifierName())
                .optionName(modifier.getOptionName())
                .priceAdjustment(modifier.getPriceAdjustment())
                .build();
    }
}
