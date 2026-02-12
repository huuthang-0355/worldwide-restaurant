package com.example.RestaurantBackend.dto.request.cateogry;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}
