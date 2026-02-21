package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.MenuItem;
import com.example.RestaurantBackend.model.MenuItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestMenuItemResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private MenuItemStatus status;
    private Boolean isChefRecommended;
    private int popularityScore;
    private Integer prepTimeMinutes;
    private String primaryPhotoUrl;
    private UUID categoryId;
    private String categoryName;
    private List<GuestModifierGroupResponse> modifierGroups;

    public static GuestMenuItemResponse fromEntity(MenuItem menuItem) {
        // get primary photo
        String primaryPhoto = null;

        if(menuItem.getPhotos() != null && !menuItem.getPhotos().isEmpty()) {
            primaryPhoto = menuItem.getPhotos().stream()
                    .filter(photo -> photo.getIsPrimary())
                    .map(photo -> photo.getUrl())
                    .findFirst()
                    .orElse(menuItem.getPhotos().getFirst().getUrl());
        }

        // only include active modifier groups with their options.
        List<GuestModifierGroupResponse> modifierGroups = menuItem.getModifierGroups() == null ? List.of() :
                menuItem.getModifierGroups().stream()
                        .filter(group -> group.getStatus() == DataStatus.ACTIVE)
                        .sorted(Comparator.comparingInt(g -> g.getDisplayOrder()))
                        .map(group -> GuestModifierGroupResponse.fromEntity(group))
                        .toList();

        return GuestMenuItemResponse.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .status(menuItem.getStatus())
                .isChefRecommended(menuItem.getIsChefRecommended())
                .popularityScore(menuItem.getPopularityScore())
                .prepTimeMinutes(menuItem.getPrepTimeMinutes())
                .primaryPhotoUrl(primaryPhoto)
                .modifierGroups(modifierGroups)
                .categoryId(menuItem.getCategoryId())
                .categoryName(menuItem.getCategory().getName())
                .build();
    }
}
