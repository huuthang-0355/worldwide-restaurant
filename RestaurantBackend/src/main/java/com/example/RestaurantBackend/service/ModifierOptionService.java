package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.modifier_option.ModifierOptionRequest;
import com.example.RestaurantBackend.dto.request.modifier_option.ModifierOptionUpdateRequest;
import com.example.RestaurantBackend.model.enums.DataStatus;
import com.example.RestaurantBackend.model.ModifierGroup;
import com.example.RestaurantBackend.model.ModifierOption;
import com.example.RestaurantBackend.repo.ModifierGroupRepo;
import com.example.RestaurantBackend.repo.ModifierOptionRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModifierOptionService {

    private final ModifierOptionRepo modifierOptionRepo;
    private final ModifierGroupRepo modifierGroupRepo;

    public ModifierOption updateModifierOption(UUID id, ModifierOptionUpdateRequest request) {
        ModifierOption modifierOption = modifierOptionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Modifier option not found"));

        if(request.getName() != null) modifierOption.setName(request.getName());
        if(request.getPriceAdjustment() != null) modifierOption.setPriceAdjustment(request.getPriceAdjustment());

        return modifierOptionRepo.save(modifierOption);
    }

    @Transactional
    public ModifierOption createModifierOption(UUID groupId, ModifierOptionRequest request) {

        // find group
        ModifierGroup group = modifierGroupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Modifier group not found"));

        ModifierOption option = new ModifierOption();
        option.setName(request.getName());
        option.setPriceAdjustment(request.getPriceAdjustment());
        option.setStatus(DataStatus.ACTIVE);
        option.setGroup(group);

        group.getOptions().add(option);

        modifierGroupRepo.save(group);

        return option;
    }
}
