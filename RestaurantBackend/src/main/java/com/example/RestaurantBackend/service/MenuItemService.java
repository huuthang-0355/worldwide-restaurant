package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.model.MenuItem;
import com.example.RestaurantBackend.dto.request.menu_item.MenuItemRequest;
import com.example.RestaurantBackend.dto.request.menu_item.MenuItemUpdateRequest;
import com.example.RestaurantBackend.dto.request.menu_item_modifier.MenuItemModifierRequest;
import com.example.RestaurantBackend.model.Category;
import com.example.RestaurantBackend.model.enums.MenuItemStatus;
import com.example.RestaurantBackend.model.ModifierGroup;
import com.example.RestaurantBackend.repo.CategoryRepo;
import com.example.RestaurantBackend.repo.MenuItemRepo;
import com.example.RestaurantBackend.repo.ModifierGroupRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepo menuItemRepo;
    private final CategoryRepo categoryRepo;
    private final ModifierGroupRepo modifierGroupRepo;

    public List<MenuItem> getAllMenuItems() {

        return menuItemRepo.findAll();
    }

    public MenuItem createMenuItem(MenuItemRequest request) {
        // check name exist
        if(menuItemRepo.existsByName(request.getName()))
            throw new RuntimeException("Menu item name already exists");

        // find category
        Category category = categoryRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // map dto -> entity
        MenuItem menuItem = MenuItem.builder()
                .name(request.getName())
                .price(request.getPrice())
                .category(category)
                .isChefRecommended(request.getIsChefRecommended() != null ? request.getIsChefRecommended() : false)
                .description(request.getDescription())
                .status(MenuItemStatus.valueOf(request.getStatus()))
                .prepTimeMinutes(request.getPrepTimeMinutes())
                .build();

        return menuItemRepo.save(menuItem);
    }

    public MenuItem updateMenuItem(UUID id, MenuItemUpdateRequest request) {

        MenuItem item = menuItemRepo.findById(id).orElseThrow(() -> new RuntimeException("Menu item not found"));

        // check updated category_id is different from current category_id -> move item to other category
        if(request.getCategoryId() != null && !item.getCategory().getId().equals(request.getCategoryId())) {
            Category newCategory = categoryRepo.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            item.setCategory(newCategory);
        }

        if(request.getName() != null) item.setName(request.getName());
        if(request.getDescription() != null) item.setDescription(request.getDescription());
        if(request.getPrice() != null) item.setPrice(request.getPrice());
        if(request.getIsChefRecommended() != null) item.setIsChefRecommended(request.getIsChefRecommended());
        if(request.getPrepTimeMinutes() != null) item.setPrepTimeMinutes(request.getPrepTimeMinutes());

        if(request.getStatus() != null)
            item.setStatus(MenuItemStatus.valueOf(request.getStatus()));

        return menuItemRepo.save(item);
    }

    public void deleteMenuItem(UUID id) {
        MenuItem deletedItem = menuItemRepo.findById(id).orElseThrow(() -> new RuntimeException("Menu item not found"));

        // soft delete
        deletedItem.setIsDeleted(true);

        menuItemRepo.save(deletedItem);
    }

    public MenuItem getMenuItemById(UUID id) {
        MenuItem item = menuItemRepo.findById(id).orElseThrow(() -> new RuntimeException("Menu item not found"));

        return item;
    }

    @Transactional // make sure hibernate can load old list (lazy load) and update table.
    public MenuItem addModifierGroupsToItem(UUID id, MenuItemModifierRequest request) {
        // 1. find item
        MenuItem menuItem = menuItemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // 2. find list of new groups that client sent up.
        List<ModifierGroup> newGroups = modifierGroupRepo.findAllById(request.getModifierGroupIds());

        if(newGroups.size() != request.getModifierGroupIds().size())
            throw new RuntimeException("Some modifier groups not found");

        // 3. append logic
        // get current list
        List<ModifierGroup> currentGroups = menuItem.getModifierGroups();

        // if current list is null, which means item hasn't had options -> create new one.
        if(currentGroups == null) {
            currentGroups = new ArrayList<>();
            menuItem.setModifierGroups(currentGroups);
        }

        // 4. traverse all group and check with new groups whether one of them is duplicated
        for(ModifierGroup newGroup : newGroups) {
            boolean exists = currentGroups.stream()
                    .anyMatch(existingGroup -> existingGroup.getId().equals(newGroup.getId()));

            if(!exists)
                currentGroups.add(newGroup);

        }

        menuItem.setModifierGroups(currentGroups);

        return menuItemRepo.save(menuItem);
    }
}
