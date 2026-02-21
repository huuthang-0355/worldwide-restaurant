package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestCategoryResponse {

    private UUID id;
    private String name;
    private String description;
    private int displayOrder;

    public static GuestCategoryResponse fromEntity(Category category) {

        return GuestCategoryResponse.builder()
                .id(category.getId())
                .description(category.getDescription())
                .name(category.getName())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

}
