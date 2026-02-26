package com.example.RestaurantBackend.dto.response.pending_order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingOrderListResponse {

    private boolean success;
    private String message;
    private List<PendingOrderResponse> orders;
    private int totalOrders;

    public static PendingOrderListResponse success(List<PendingOrderResponse> orders) {
        return PendingOrderListResponse.builder()
                .success(true)
                .message("Pending orders retrieved successfully")
                .orders(orders)
                .totalOrders(orders.size())
                .build();
    }

    public static PendingOrderListResponse error(String message) {
        return PendingOrderListResponse.builder()
                .success(false)
                .message(message)
                .orders(List.of())
                .totalOrders(0)
                .build();
    }

}
