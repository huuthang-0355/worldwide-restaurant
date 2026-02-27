package com.example.RestaurantBackend.dto.momo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MomoQueryResponse {

    private String partnerCode;
    private String orderId;
    private String requestId;
    private String extraData;
    private Long amount;
    private Long transId;
    private String payType;
    private Integer resultCode;
    private String message;
    private Long responseTime;

}
