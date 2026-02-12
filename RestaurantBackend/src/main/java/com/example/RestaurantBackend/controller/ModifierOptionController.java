package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.modifier_option.ModifierOptionUpdateRequest;
import com.example.RestaurantBackend.model.ModifierOption;
import com.example.RestaurantBackend.service.ModifierOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/menu/modifier-options")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ModifierOptionController {

    private final ModifierOptionService modifierOptionService;


    @PutMapping("/{id}")
    public ResponseEntity<?> updateModifierOption(@PathVariable UUID id
                                            , @RequestBody ModifierOptionUpdateRequest request) {
        try {
            ModifierOption updatedOption = modifierOptionService.updateModifierOption(id, request);
            return new ResponseEntity<>(updatedOption, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
