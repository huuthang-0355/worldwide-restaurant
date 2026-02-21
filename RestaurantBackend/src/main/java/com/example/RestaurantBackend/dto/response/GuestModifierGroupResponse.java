package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.ModifierGroup;
import com.example.RestaurantBackend.model.SelectionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestModifierGroupResponse {

    private UUID id;
    private String name;
    private SelectionType selectionType;
    private Boolean isRequired;
    private int minSelection;
    private int maxSelection;
    private int displayOrder;
    private List<GuestModifierOptionResponse> options;

    public static GuestModifierGroupResponse fromEntity(ModifierGroup group) {
        // get options
        List<GuestModifierOptionResponse> options = group.getOptions().stream()
                .filter(o -> o.getStatus() == DataStatus.ACTIVE )
                .map(option -> GuestModifierOptionResponse.fromEntity(option))
                .toList();

        return GuestModifierGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .selectionType(group.getSelectionType())
                .isRequired(group.getIsRequired())
                .minSelection(group.getMinSelection())
                .maxSelection(group.getMaxSelection())
                .displayOrder(group.getDisplayOrder())
                .options(options)
                .build();
    }
}
