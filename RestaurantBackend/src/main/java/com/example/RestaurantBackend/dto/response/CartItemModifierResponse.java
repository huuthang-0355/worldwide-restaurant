package com.example.RestaurantBackend.dto.response;


import com.example.RestaurantBackend.model.CartItemModifier;
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
public class CartItemModifierResponse {

    private UUID id;
    private UUID modifierOptionId;
    private String modifierGroupName;
    private String optionName;
    private BigDecimal priceAdjustment;

    public static CartItemModifierResponse fromEntity(CartItemModifier modifier) {
        return CartItemModifierResponse.builder()
                .id(modifier.getId())
                .modifierOptionId(modifier.getModifierOption().getId())
                .modifierGroupName(modifier.getModifierGroupName())
                .optionName(modifier.getOptionName())
                .priceAdjustment(modifier.getPriceAdjustment())
                .build();
    }

}
