package com.example.RestaurantBackend.dto.response.bill_request;

import com.example.RestaurantBackend.model.Session;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillRequestResponse {

    private UUID sessionId;
    private UUID tableId;
    private String tableNumber;
    private SessionStatus status;
    private Integer guestCount;
    private LocalDateTime startedAt;
    private LocalDateTime billRequestedAt;
    private BigDecimal estimatedTotal;
    private Integer orderCount;

    public static BillRequestResponse fromEntity(Session session) {

         BigDecimal estimatedTotal = session.getOrders() == null
                ? BigDecimal.ZERO
                : session.getOrders().stream()
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);


        return BillRequestResponse.builder()
                .sessionId(session.getId())
                .tableId(session.getTable().getId())
                .tableNumber(session.getTable().getTableNumber())
                .status(session.getStatus())
                .guestCount(session.getGuestCount())
                .startedAt(session.getStartedAt())
                .billRequestedAt(session.getUpdatedAt())
                .estimatedTotal(estimatedTotal)
                .orderCount(session.getOrders().size())
                .build();
    }
}
