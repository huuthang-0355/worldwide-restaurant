package com.example.RestaurantBackend.dto.response.payment;

import com.example.RestaurantBackend.model.Payment;
import com.example.RestaurantBackend.model.enums.PaymentMethod;
import com.example.RestaurantBackend.model.enums.PaymentStatus;
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
public class PaymentStatusResponse {
    private boolean success;
    private String message;
    private UUID paymentId;
    private UUID sessionId;
    private PaymentMethod method;
    private PaymentStatus status;
    private BigDecimal totalAmount;
    private String paymentReference;
    private String gatewayTransactionId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public static PaymentStatusResponse fromEntity(Payment payment) {

        return PaymentStatusResponse.builder()
                .success(true)
                .message("Payment status retrieved successfully")
                .paymentId(payment.getId())
                .sessionId(payment.getSession().getId())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .totalAmount(payment.getTotalAmount())
                .paymentReference(payment.getPaymentReference())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public static PaymentStatusResponse success(Payment payment) {

        return PaymentStatusResponse.fromEntity(payment);
    }

    public static PaymentStatusResponse error(String message) {

        return PaymentStatusResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

}
