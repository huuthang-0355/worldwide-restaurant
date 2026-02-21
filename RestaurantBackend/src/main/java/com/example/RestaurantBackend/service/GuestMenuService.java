package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.response.GuestCategoryResponse;
import com.example.RestaurantBackend.dto.response.GuestMenuItemResponse;
import com.example.RestaurantBackend.dto.response.GuestMenuResponse;
import com.example.RestaurantBackend.dto.response.MenuAccessResponse;
import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.MenuItem;
import com.example.RestaurantBackend.model.ModifierGroup;
import com.example.RestaurantBackend.repo.CategoryRepo;
import com.example.RestaurantBackend.repo.MenuItemRepo;
import com.example.RestaurantBackend.repo.ModifierGroupRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuestMenuService {

    private final TableService tableService;
    private final MenuItemRepo menuItemRepo;
    private final CategoryRepo categoryRepo;
    private final ModifierGroupRepo modifierGroupRepo;

    private final int MAX_LIMIT = 50;
    private final int DEFAULT_LIMIT = 10;
    private final int DEFAULT_PAGE = 1;

    @Transactional
    public GuestMenuResponse getMenu(
            String token,
            String query,
            UUID categoryId,
            String sort,
            Boolean chefRecommended,
            int page,
            int limit
    ) {

        // validate QR Code and get table context
        MenuAccessResponse tableAccess = tableService.verifyQrToken(token);
        if(!tableAccess.getValid())
            return GuestMenuResponse.error(tableAccess.getMessage());

        // sanitize pagination params
        int safePage = Math.max(DEFAULT_PAGE, page);
        int safeLimit = (limit <= 0 || limit > MAX_LIMIT) ? DEFAULT_LIMIT : limit;

        // build sort strategy
        Sort sortStrategy = buildSort(sort);

        // build pageable
        Pageable pageable = PageRequest.of(safePage - 1, safeLimit, sortStrategy);

        // sanitize query param
        String sanitizedQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : "";

        // fetch paginated menu items
        Page<MenuItem> itemPage = menuItemRepo.findGuestMenuItems(
                DataStatus.ACTIVE,
                sanitizedQuery,
                categoryId,
                chefRecommended,
                pageable
        );

        List<MenuItem> pagedItems = itemPage.getContent();
        List<GuestMenuItemResponse> items;

        if(pagedItems.isEmpty())
            items = List.of();
        else {
            // Extract IDs
            List<UUID> ids = pagedItems.stream()
                    .map(item -> item.getId())
                    .collect(Collectors.toUnmodifiableList());

            // fetch with photos
            Map<UUID, MenuItem> withPhotos = menuItemRepo.findWithPhotosByIds(ids)
                    .stream()
                    .collect(Collectors.toMap(item -> item.getId(), Function.identity()));

            // fetch with modifiers (groups only)
            Map<UUID, MenuItem> withModifiers = menuItemRepo.findWithModifiersByIds(ids)
                .stream()
                .collect(Collectors.toMap(item -> item.getId(), Function.identity()));

            // fetch modifier options separately to avoid multiple bag fetch
            List<UUID> groupIds = withModifiers.values().stream()
                .flatMap(item -> item.getModifierGroups() == null
                    ? java.util.stream.Stream.empty()
                    : item.getModifierGroups().stream())
                .map(ModifierGroup::getId)
                .distinct()
                .toList();

            Map<UUID, ModifierGroup> groupsWithOptions = groupIds.isEmpty()
                ? Map.of()
                : modifierGroupRepo.findWithOptionsByIds(groupIds)
                .stream()
                .collect(Collectors.toMap(ModifierGroup::getId, Function.identity()));

            // merge and map
            items = pagedItems.stream()
                    .map(item -> {
                        MenuItem photoItem = withPhotos.get(item.getId());
                        MenuItem modItem = withModifiers.get(item.getId());

                        if (photoItem != null) {
                            item.setPhotos(photoItem.getPhotos());
                            item.setCategory(photoItem.getCategory());
                        }
                        if (modItem != null) {
                            List<ModifierGroup> groups = modItem.getModifierGroups();
                            if (groups != null) {
                                groups.forEach(group -> {
                                    ModifierGroup fullGroup = groupsWithOptions.get(group.getId());
                                    if (fullGroup != null) {
                                        group.setOptions(fullGroup.getOptions());
                                    }
                                });
                            }
                            item.setModifierGroups(groups);
                        }

                        return GuestMenuItemResponse.fromEntity(item);
                    })
                    .toList();
        }

        // fetch all active category
        List<GuestCategoryResponse> categories = categoryRepo.findByStatusOrderByDisplayOrderAsc(DataStatus.ACTIVE)
                .stream()
                .map(cate -> GuestCategoryResponse.fromEntity(cate))
                .toList();

        return GuestMenuResponse.success(
                tableAccess.getTableId(),
                tableAccess.getTableNumber(),
                categories,
                items,
                safePage,
                safeLimit,
                itemPage.getTotalPages(),
                sanitizedQuery,
                categoryId,
                sort,
                chefRecommended
        );

    }

    Sort buildSort(String sort) {
        if(sort == null)
            return Sort.by(Sort.Direction.ASC, "name");

        switch (sort.toLowerCase()) {
            case "popularity":
                return Sort.by(Sort.Direction.DESC, "popularity");
            case "price_asc":
                return Sort.by(Sort.Direction.ASC, "price");
            case "price_desc":
                return Sort.by(Sort.Direction.DESC, "price");
            case "newest":
                return Sort.by(Sort.Direction.DESC, "createdAt");
            case "name":
            default:
                return Sort.by(Sort.Direction.ASC, "name");
        }
    }
}
