package com.example.RestaurantBackend.dto.request.modifier_group;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ModifierGroupUpdateRequest {

    private String name;

    private String selectionType;

    private Boolean isRequired;

    @Min(0)
    private Integer minSelection;

    @Min(0)
    private Integer maxSelection;


    private Integer displayOrder;
    private String status;
}
