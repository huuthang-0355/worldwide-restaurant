package com.example.RestaurantBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffListResponse {

    private boolean success;
    private String message;
    private List<UserResponse> staff;
    private int total;

}
