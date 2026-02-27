package com.example.RestaurantBackend.dto.response.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillPreviewResponse {

    private boolean success;
    private String message;
    private UUID sessionId;
    private String tableNumber;
    private Integer guestCount;
    private List<BillPreviewItemResponse> items;
    private int totalItemCount;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal serviceChargeRate;
    private BigDecimal serviceCharge;
    private BigDecimal totalAmount;
    private String currency;
    private int orderCount;
    private LocalDateTime sessionStartedAt;

    public static BillPreviewResponse error(String message) {
        return BillPreviewResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
