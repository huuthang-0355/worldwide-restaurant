package com.example.RestaurantBackend.dto.request.modifier_option;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ModifierOptionRequest {
    @NotBlank(message = "Option name is required")
    private String name;

    @Min(value = 0, message = "Price adjustment cannot be negative")
    private BigDecimal priceAdjustment;
}
