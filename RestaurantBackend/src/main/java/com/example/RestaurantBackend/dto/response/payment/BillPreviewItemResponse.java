package com.example.RestaurantBackend.dto.response.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillPreviewItemResponse {
    private String menuItemName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal modifiersPrice;
    private BigDecimal lineTotal;
    private List<String> modifiers;
    private String specialInstructions;
}
