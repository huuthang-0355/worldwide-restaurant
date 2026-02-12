package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.cateogry.CategoryRequest;
import com.example.RestaurantBackend.dto.request.cateogry.CategoryStatusRequest;
import com.example.RestaurantBackend.dto.request.cateogry.CategoryUpdateRequest;
import com.example.RestaurantBackend.model.Category;
import com.example.RestaurantBackend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return new ResponseEntity<>(categoryService.getAllCategories(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable UUID id) {
        try {
            Category category = categoryService.getCategoryById(id);
            return new ResponseEntity<>(category, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {

        Category createdCategory = categoryService.createCategory(categoryRequest);

        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryUpdateRequest request) {

        try {
            Category updatedCategory = categoryService.updateCategory(id, request);
            return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Category> updateCategoryStatus(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryStatusRequest request) {

        try {
            Category updatedCategory = categoryService.updateCategoryStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedCategory);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

    }
}
