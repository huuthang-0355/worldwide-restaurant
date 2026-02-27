package com.example.RestaurantBackend.dto.request.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MomoPaymentRequest {

    @NotNull(message = "Session ID is required")
    private UUID sessionId;
    private String returnUrl;
}
