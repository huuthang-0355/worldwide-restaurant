package com.example.RestaurantBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestMenuResponse {
    private Boolean success;
    private String message;

    // Table context
    private UUID tableId;
    private String tableNumber;

    // Categories (all active)
    List<GuestCategoryResponse> categories;

    // paginated items
    List<GuestMenuItemResponse> items;

    // pagination metadata
    private int page;
    private int limit;
    private long totalItems;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

    // Applied filters
    private String query;
    private UUID categoryId;
    private String sort;
    private Boolean chefRecommended;

    public static GuestMenuResponse success(
            UUID tableId,
            String tableNumber,
            List<GuestCategoryResponse> categories,
            List<GuestMenuItemResponse> items,
            int page, int limit, long totalItems,
            String query,
            UUID categoryId,
            String sort,
            Boolean chefRecommended
    ) {
        int totalPages = (int) Math.ceil((double) totalItems / limit);

        return GuestMenuResponse.builder()
                .success(true)
                .message("Menu loaded successfully")
                .tableId(tableId)
                .tableNumber(tableNumber)
                .categories(categories)
                .items(items)
                .page(page)
                .limit(limit)
                .totalItems(totalItems)
                .totalPages(totalPages)
                .hasNext(page < totalPages)
                .hasPrevious(page > 1)
                .query(query)
                .categoryId(categoryId)
                .sort(sort)
                .chefRecommended(chefRecommended)
                .build();
    }

    public static GuestMenuResponse error(String message) {
        return GuestMenuResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
