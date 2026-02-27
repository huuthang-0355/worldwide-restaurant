package com.example.RestaurantBackend.dto.response.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomoCallbackResponse {
    private int status;
    private String message;

    public static MomoCallbackResponse success(String message) {
        return MomoCallbackResponse.builder()
                .status(0)
                .message(message)
                .build();
    }

    public static MomoCallbackResponse error(String message) {
        return MomoCallbackResponse.builder()
                .status(1)
                .message(message)
                .build();
    }

}
