package com.example.RestaurantBackend.dto.request.modifier_option;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ModifierOptionUpdateRequest {
    private String name;

    @Min(value = 0, message = "Price adjustment cannot be negative")
    private BigDecimal priceAdjustment;
}
