package com.example.RestaurantBackend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private Boolean success;
    private String message;

    public static MessageResponse success(String message) {
        return new MessageResponse(true, message);
    }

    public static MessageResponse error(String message) {
        return new MessageResponse(false, message);
    }
}
