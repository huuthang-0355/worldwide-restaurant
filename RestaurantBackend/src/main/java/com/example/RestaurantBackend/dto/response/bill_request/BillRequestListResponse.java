package com.example.RestaurantBackend.dto.response.bill_request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillRequestListResponse {

    private boolean success;
    private String message;
    private List<BillRequestResponse> billRequests;
    private int totalRequests;

    public static BillRequestListResponse success(List<BillRequestResponse> requests){
        return BillRequestListResponse.builder()
                .success(true)
                .message("Bill requests retrieved successfully")
                .billRequests(requests)
                .totalRequests(requests.size())
                .build();
    }

    public static BillRequestListResponse error(String message) {
        return BillRequestListResponse.builder()
                .success(false)
                .message(message)
                .billRequests(List.of())
                .totalRequests(0)
                .build();
    }

}
