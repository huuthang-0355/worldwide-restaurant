package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.menu_item.MenuItemRequest;
import com.example.RestaurantBackend.dto.request.menu_item.MenuItemUpdateRequest;
import com.example.RestaurantBackend.dto.request.menu_item_modifier.MenuItemModifierRequest;
import com.example.RestaurantBackend.model.MenuItem;
import com.example.RestaurantBackend.service.MenuItemPhotoService;
import com.example.RestaurantBackend.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.cfg.defs.UUIDDef;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/menu/items")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final MenuItemPhotoService menuItemPhotoService;


    @GetMapping()
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        return new ResponseEntity<>(menuItemService.getAllMenuItems(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable UUID id) {
        try {
           MenuItem item = menuItemService.getMenuItemById(id);
           return new ResponseEntity<>(item, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping()
    public ResponseEntity<MenuItem> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        MenuItem createdItem = menuItemService.createMenuItem(request);

        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable UUID id, @Valid @RequestBody MenuItemUpdateRequest request) {

        try {
            MenuItem updatedItem = menuItemService.updateMenuItem(id, request);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id) {

        try {
            menuItemService.deleteMenuItem(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // --------------- Photo Controllers -------------

    @PostMapping(value = "/{id}/photo", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadPhoto(@PathVariable("id") UUID menuItemId,
                                                     @RequestParam("photo") MultipartFile file) {

        try {
            return new ResponseEntity<>(menuItemPhotoService.uploadPhoto(menuItemId, file), HttpStatus.CREATED);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

    }

    @PatchMapping("/{menuItemId}/photo/{photoId}/primary")
    public ResponseEntity<String> setPrimaryPhoto(@PathVariable("menuItemId") UUID menuItemId,
                                                @PathVariable("photoId") UUID photoId) {

        try {
            menuItemPhotoService.setPrimaryPhoto(menuItemId, photoId);

            return new ResponseEntity<>("Success", HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

    }

    @DeleteMapping("/{menuItemId}/photo/{photoId}")
    public ResponseEntity<?> deletePhoto(@PathVariable("menuItemId") UUID menuItemId,
                                            @PathVariable("photoId") UUID photoId) {

        try {
            menuItemPhotoService.deletePhoto(menuItemId, photoId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }

    }

    // ----------------- Modifier Group -----------
    @PostMapping("/{id}/modifier-groups")
    public ResponseEntity<MenuItem> addModifierGroupsToItem(@PathVariable UUID id,
                                                      @Valid @RequestBody MenuItemModifierRequest request) {
        try {
            return new ResponseEntity<>(menuItemService.addModifierGroupsToItem(id, request), HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
