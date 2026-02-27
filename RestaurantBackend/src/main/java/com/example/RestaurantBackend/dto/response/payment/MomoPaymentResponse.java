package com.example.RestaurantBackend.dto.response.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomoPaymentResponse {

    private boolean success;
    private String message;
    private UUID paymentId;
    private String requestId;
    private String payUrl;
    private String deeplink;
    private String qrCodeUrl;
    private BigDecimal amount;

    public static MomoPaymentResponse success(UUID paymentId, String requestId,
                                              String payUrl, String deeplink,
                                              String qrCodeUrl, BigDecimal amount) {
        return MomoPaymentResponse.builder()
                .success(true)
                .message("Payment initiated successfully")
                .paymentId(paymentId)
                .requestId(requestId)
                .payUrl(payUrl)
                .deeplink(deeplink)
                .qrCodeUrl(qrCodeUrl)
                .amount(amount)
                .build();
    }

    public static MomoPaymentResponse error(String message) {
        return MomoPaymentResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

}
