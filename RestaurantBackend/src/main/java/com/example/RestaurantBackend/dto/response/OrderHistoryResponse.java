package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.dto.response.order.OrderResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderHistoryResponse {
    private boolean success;
    private String message;
    private List<OrderResponse> orders;
    private int totalSessions;
    private int totalOrders;

    public static OrderHistoryResponse success(List<OrderResponse> orders, int totalSessions) {
        return OrderHistoryResponse.builder()
                .success(true)
                .message("Order history retrieved successfully")
                .orders(orders)
                .totalSessions(totalSessions)
                .totalOrders(orders.size())
                .build();
    }

    public static OrderHistoryResponse error(String message) {
        return OrderHistoryResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
