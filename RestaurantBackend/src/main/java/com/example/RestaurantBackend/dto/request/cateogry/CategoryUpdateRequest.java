package com.example.RestaurantBackend.dto.request.cateogry;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryUpdateRequest {

    @Size(min = 2, max = 50, message = "Length from 2 to 50 characters")
    private String name;

    private String description;
    private Integer displayOrder;
    private String status;
}
