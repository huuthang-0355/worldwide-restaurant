package com.example.RestaurantBackend.dto.request;

import com.example.RestaurantBackend.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderFilterRequest {

    private OrderStatus status;

    private String sortBy;

    private String sortDirection;
}
