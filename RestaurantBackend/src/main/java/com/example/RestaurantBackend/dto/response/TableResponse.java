package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableResponse {

    private UUID id;
    private String tableNumber;
    private Integer capacity;
    private String location;
    private String description;
    private DataStatus status;
    private boolean hasQrCode;
    private LocalDateTime qrTokenCreatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TableResponse fromEntity(Table table) {

        return TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .location(table.getLocation())
                .description(table.getDescription())
                .status(table.getStatus())
                .hasQrCode(table.getQrToken() != null && !table.getQrToken().isEmpty())
                .qrTokenCreatedAt(table.getQrTokenCreatedAt())
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();
    }

}
