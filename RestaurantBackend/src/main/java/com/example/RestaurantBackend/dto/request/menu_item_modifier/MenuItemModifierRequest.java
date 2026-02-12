package com.example.RestaurantBackend.dto.request.menu_item_modifier;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class MenuItemModifierRequest {

    @NotNull(message = "List of modifier group IDs is required")
    private List<UUID> modifierGroupIds;
}
