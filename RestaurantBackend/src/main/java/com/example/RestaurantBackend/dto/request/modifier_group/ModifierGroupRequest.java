package com.example.RestaurantBackend.dto.request.modifier_group;

import com.example.RestaurantBackend.dto.request.modifier_option.ModifierOptionRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ModifierGroupRequest {

    @NotBlank(message = "Group name is required")
    private String name;

    @NotBlank(message = "Selection type is required (SINGLE/MULTIPLE)")
    private String selectionType;

    @NotNull
    private Boolean isRequired;

    @Min(0)
    private Integer minSelection;

    @Min(0)
    private Integer maxSelection;


    private Integer displayOrder;
    private String status;

    @Valid
    private List<ModifierOptionRequest> options;
}
