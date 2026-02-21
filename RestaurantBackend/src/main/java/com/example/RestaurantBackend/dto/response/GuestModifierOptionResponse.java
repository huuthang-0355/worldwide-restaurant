package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.ModifierOption;
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
public class GuestModifierOptionResponse {

    private UUID id;
    private String name;
    private BigDecimal priceAdjustment;

    public static GuestModifierOptionResponse fromEntity(ModifierOption option) {

        return GuestModifierOptionResponse.builder()
                .id(option.getId())
                .name(option.getName())
                .priceAdjustment(option.getPriceAdjustment())
                .build();
    }
}
