package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.modifier_group.ModifierGroupRequest;
import com.example.RestaurantBackend.dto.request.modifier_group.ModifierGroupUpdateRequest;
import com.example.RestaurantBackend.dto.request.modifier_option.ModifierOptionRequest;
import com.example.RestaurantBackend.model.ModifierGroup;
import com.example.RestaurantBackend.service.ModifierGroupService;
import com.example.RestaurantBackend.service.ModifierOptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/menu/modifier-groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ModifierGroupController {

    private final ModifierGroupService modifierGroupService;
    private final ModifierOptionService modifierOptionService;

    @GetMapping
    public ResponseEntity<List<ModifierGroup>> getAllModifierGroups() {
        return new ResponseEntity<>(modifierGroupService.getAllModifierGroups(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModifierGroup> getModifierGroupById(@PathVariable UUID id) {
        try {
            return new ResponseEntity<>(modifierGroupService.getModifierGroupById(id), HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<?> createModifierGroup(@Valid @RequestBody ModifierGroupRequest request) {
        System.out.println(request);
        try {
            return new ResponseEntity<>(modifierGroupService.createModifierGroup(request)
                                        , HttpStatus.CREATED);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateModifierGroup(@PathVariable("id") UUID groupId
                                    , @Valid @RequestBody ModifierGroupUpdateRequest request) {
        try {
            ModifierGroup updatedModifierGroup = modifierGroupService.updateModifierGroup(groupId, request);
            return new ResponseEntity<>(updatedModifierGroup, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{groupId}/options")
    public ResponseEntity<?> createModifierOption(@PathVariable UUID groupId,
                                                  @RequestBody ModifierOptionRequest request) {
        try {
            return new ResponseEntity<>(modifierOptionService.createModifierOption(groupId, request), HttpStatus.CREATED);
        }catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

}
