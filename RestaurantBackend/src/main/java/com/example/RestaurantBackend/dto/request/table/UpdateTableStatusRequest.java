package com.example.RestaurantBackend.dto.request.table;

import com.example.RestaurantBackend.model.DataStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTableStatusRequest {

    @NotNull(message = "Status is required")
    private DataStatus status;
}
