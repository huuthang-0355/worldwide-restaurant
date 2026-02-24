package com.example.RestaurantBackend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartSessionRequest {

    @NotBlank(message = "QR token is required")
    private String token;

    @Min(value = 1, message = "Guest count must be at least 1")
    private Integer guestCount;
}
