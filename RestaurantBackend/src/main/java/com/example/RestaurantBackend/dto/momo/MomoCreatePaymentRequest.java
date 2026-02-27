package com.example.RestaurantBackend.dto.momo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


// backend -> momo
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomoCreatePaymentRequest {
    private String partnerCode;
    private String partnerName;
    private String storeId;
    private String requestId;
    private Long amount;
    private String orderId;
    private String orderInfo;
    private String redirectUrl;
    private String ipnUrl;
    private String lang;
    private String requestType;
    private boolean autoCapture;
    private String extraData;
    private String signature;
}
