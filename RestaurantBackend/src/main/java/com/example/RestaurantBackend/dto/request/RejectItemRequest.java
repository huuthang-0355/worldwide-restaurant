package com.example.RestaurantBackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectItemRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
