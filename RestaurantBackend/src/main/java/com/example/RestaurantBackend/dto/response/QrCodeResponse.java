package com.example.RestaurantBackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrCodeResponse {

    private Boolean success;
    private String message;
    private UUID tableId;
    private String tableNumber;
    private String qrUrl;
    private LocalDateTime generatedAt;

    public static QrCodeResponse success(UUID tableId, String tableNumber, String qrUrl, LocalDateTime generatedAt) {

        return QrCodeResponse.builder()
                .success(true)
                .message("QR code generated successfully")
                .tableNumber(tableNumber)
                .tableId(tableId)
                .qrUrl(qrUrl)
                .generatedAt(generatedAt)
                .build();
    }

    public static QrCodeResponse error(String message) {

        return QrCodeResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
