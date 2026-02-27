package com.example.RestaurantBackend.dto.momo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomoQueryRequest {
    private String partnerCode;
    private String requestId;
    private String orderId;
    private String lang;
    private String signature;

}
