package com.example.RestaurantBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckEmailResponse {
    private Boolean success;
    private String message;

    public static CheckEmailResponse available() {
        return new CheckEmailResponse(true, "Email is available");
    }

    public static CheckEmailResponse taken() {
        return new CheckEmailResponse(false, "Email is already registered");
    }
}
