package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.cateogry.CategoryRequest;
import com.example.RestaurantBackend.dto.request.cateogry.CategoryUpdateRequest;
import com.example.RestaurantBackend.model.Category;
import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.repo.CategoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepo repo;

    @Autowired
    public CategoryService(CategoryRepo repo) {
        this.repo = repo;
    }

    public List<Category> getAllCategories() {
        return repo.findAll();
    }

    public Category createCategory(CategoryRequest categoryRequest) {
        if(repo.existsByName(categoryRequest.getName()))
            throw new RuntimeException("The category name existed");

        // Map DTO -> Entity
        Category category = Category.builder()
                .name(categoryRequest.getName())
                .description(categoryRequest.getDescription())
                .status(DataStatus.ACTIVE)
                .displayOrder(categoryRequest.getDisplayOrder() != null ? categoryRequest.getDisplayOrder() : 0)
                .build();

        return repo.save(category);
    }

    public Category updateCategory(UUID id, CategoryUpdateRequest request) {
        Category category = repo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

        // check if new name of category is duplicated with existing categories
        if(request.getName() != null && repo.existsByNameAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Category name already exists");
        }


        if(request.getName() != null) category.setName(request.getName());
        if(request.getDescription() != null) category.setDescription(request.getDescription());
        if(request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());

        if(request.getStatus() != null) {
            category.setStatus(DataStatus.valueOf(request.getStatus().toUpperCase()));
        }


        return repo.save(category);
    }

    public Category updateCategoryStatus(UUID id, String statusStr) {

        Category category = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        try {
            DataStatus newStatus = DataStatus.valueOf(statusStr.toUpperCase());
            category.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status. Allowed values: ACTIVE, INACTIVE");
        }

        return repo.save(category);
    }

    public Category getCategoryById(UUID id) {
        Category category = repo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

        return category;
    }
}
