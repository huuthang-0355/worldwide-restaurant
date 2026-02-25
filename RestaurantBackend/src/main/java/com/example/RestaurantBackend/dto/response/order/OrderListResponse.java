package com.example.RestaurantBackend.dto.response.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderListResponse {

    private boolean success;
    private String message;
    private List<OrderResponse> orders;
    private int count;

    public static OrderListResponse success(List<OrderResponse> orders) {
        return OrderListResponse.builder()
                .success(true)
                .message("Orders retrieved successfully")
                .orders(orders)
                .count(orders.size())
                .build();
    }

    public static OrderListResponse error(String message) {
        return OrderListResponse.builder()
                .success(false)
                .message(message)
                .orders(List.of())
                .count(0)
                .build();
    }

}
