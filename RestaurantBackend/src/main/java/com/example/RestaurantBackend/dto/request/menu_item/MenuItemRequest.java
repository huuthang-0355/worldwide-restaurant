package com.example.RestaurantBackend.dto.request.menu_item;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class MenuItemRequest {
    @NotBlank(message = "Item name is required")
    @Size(min = 2, max = 50, message = "Name's length must be from 2 to 50")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be greater than 0")
    private BigDecimal price;

    @Min(value = 0, message = "Prep time must be greater than 0 minutes")
    @Max(value = 240, message = "Prep time must be lower than 240 minutes")
    private Integer prepTimeMinutes;

    private Boolean isChefRecommended;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;
}
