package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.modifier_group.ModifierGroupRequest;
import com.example.RestaurantBackend.dto.request.modifier_group.ModifierGroupUpdateRequest;
import com.example.RestaurantBackend.dto.request.modifier_option.ModifierOptionRequest;
import com.example.RestaurantBackend.model.enums.DataStatus;
import com.example.RestaurantBackend.model.ModifierGroup;
import com.example.RestaurantBackend.model.ModifierOption;
import com.example.RestaurantBackend.model.enums.SelectionType;
import com.example.RestaurantBackend.repo.ModifierGroupRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModifierGroupService {

    private final ModifierGroupRepo modifierGroupRepo;

    public List<ModifierGroup> getAllModifierGroups() {

        return modifierGroupRepo.findAll();
    }

    public ModifierGroup getModifierGroupById(UUID id) {

        return modifierGroupRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Modifier group not found"));
    }

    @Transactional
    public ModifierGroup createModifierGroup(ModifierGroupRequest request) {
        ModifierGroup group = new ModifierGroup();
        group.setName(request.getName());
        group.setSelectionType(SelectionType.valueOf(request.getSelectionType().toUpperCase()));
        group.setIsRequired(request.getIsRequired());
        group.setMinSelection(request.getMinSelection() != null ? request.getMinSelection() : 0);
        group.setMaxSelection(request.getMaxSelection() != null ? request.getMaxSelection() : 0);
        group.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        group.setStatus(request.getStatus() != null
                ? DataStatus.valueOf(request.getStatus().toUpperCase()) : DataStatus.ACTIVE);

        // initialize options
        group.setOptions(new ArrayList<>());

        if(request.getOptions() != null) {
            for (ModifierOptionRequest optRequest : request.getOptions()) {
                ModifierOption option = new ModifierOption();
                option.setName(optRequest.getName());
                option.setPriceAdjustment(optRequest.getPriceAdjustment());

                option.setGroup(group);

                group.getOptions().add(option);
            }
        }

        // no need for saving options, because of Cascasde.ALL, when Group save, Option save.
        return modifierGroupRepo.save(group);
    }

    public ModifierGroup updateModifierGroup(UUID groupId, ModifierGroupUpdateRequest request) {
        ModifierGroup group = modifierGroupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Modifier group not found"));

        if(request.getName() != null) group.setName(request.getName());
        if(request.getIsRequired() != null) group.setIsRequired(request.getIsRequired());

        if(request.getSelectionType() != null) {
            try {
                group.setSelectionType(SelectionType.valueOf(request.getSelectionType().toUpperCase()));
            }catch (Exception e) {
                throw new RuntimeException("Invalid Selection Type");
            }

        }

        if(request.getMinSelection() != null) group.setMinSelection(request.getMinSelection());
        if(request.getMaxSelection() != null) group.setMaxSelection(request.getMaxSelection());
        if(request.getDisplayOrder() != null) group.setDisplayOrder(request.getDisplayOrder());
        if(request.getStatus() != null) {
            try {
                group.setStatus(DataStatus.valueOf(request.getStatus()));
            }catch (Exception e) {
                throw new RuntimeException("Invalid Status");
            }
        }

        return modifierGroupRepo.save(group);
    }


}
