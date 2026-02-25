package com.example.RestaurantBackend.dto.response.kds;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KdsStatsResponse {

    private boolean success;
    private String message;

    // Order counts by status
    private long receivedCount;      // PENDING/ACCEPTED
    private long preparingCount;     // IN_KITCHEN/PREPARING
    private long readyCount;         // READY
    private long completedCount;     // SERVED/COMPLETED

    private long totalActiveOrders;  // All non-completed orders
    private long overdueOrders;      // Orders exceeding prep time

    public static KdsStatsResponse success(
            long receivedCount,
            long preparingCount,
            long readyCount,
            long completedCount,
            long overdueOrders) {

        long totalActive = receivedCount + preparingCount + readyCount;

        return KdsStatsResponse.builder()
                .success(true)
                .message("Statistics retrieved successfully")
                .receivedCount(receivedCount)
                .preparingCount(preparingCount)
                .readyCount(readyCount)
                .completedCount(completedCount)
                .totalActiveOrders(totalActive)
                .overdueOrders(overdueOrders)
                .build();
    }

    public static KdsStatsResponse error(String message) {
        return KdsStatsResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
