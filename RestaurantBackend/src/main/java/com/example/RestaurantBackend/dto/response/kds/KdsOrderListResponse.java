package com.example.RestaurantBackend.dto.response.kds;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsOrderListResponse {

    private boolean success;
    private String message;
    private List<KdsOrderResponse> orders;
    private int totalOrders;
    private long overdueCount;

    public static KdsOrderListResponse success(List<KdsOrderResponse> orders) {

        long overdueCount = orders.stream()
                .map(KdsOrderResponse::getIsOverdue)
                .count();

        return KdsOrderListResponse.builder()
                .success(true)
                .message("Orders retrieved successfully")
                .orders(orders)
                .totalOrders(orders.size())
                .overdueCount(overdueCount)
                .build();

    }

    public static KdsOrderListResponse error(String message) {

        return KdsOrderListResponse.builder()
                .success(false)
                .message(message)
                .orders(List.of())
                .totalOrders(0)
                .overdueCount(0L)
                .build();
    }
}
