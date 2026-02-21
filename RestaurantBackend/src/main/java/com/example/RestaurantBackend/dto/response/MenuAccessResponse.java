package com.example.RestaurantBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuAccessResponse {

    private Boolean valid;
    private String message;
    private UUID tableId;
    private String tableNumber;
    private Integer capacity;
    private String location;

    public static MenuAccessResponse valid(UUID tableId, String tableNumber, Integer capacity, String location) {
        return MenuAccessResponse.builder()
                .valid(true)
                .message("Valid QR Code")
                .tableId(tableId)
                .tableNumber(tableNumber)
                .capacity(capacity)
                .location(location)
                .build();
    }

    public static MenuAccessResponse invalid(String message) {

        return MenuAccessResponse.builder()
                .valid(false)
                .message(message)
                .build();
    }

}
