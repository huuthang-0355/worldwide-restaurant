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
public class TableListResponse {

    private String message;
    private Boolean success;
    private List<TableResponse> tables;
    private Integer totalCount;

    public static TableListResponse success(List<TableResponse> tables) {
        return TableListResponse.builder()
                .message("Success")
                .success(true)
                .tables(tables)
                .totalCount(tables.size())
                .build();
    }

    public static TableListResponse error(String message) {
        return TableListResponse.builder()
                .message(message)
                .success(false)
                .tables(List.of())
                .totalCount(0)
                .build();
    }

}
