package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.Session;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionResponse {

    private boolean success;
    private String message;
    private UUID sessionId;
    private UUID tableId;
    private String tableNumber;
    private SessionStatus status;
    private Integer guestCount;
    private LocalDateTime startedAt;
    private List<CartItemResponse> cartItems;
    private BigDecimal cartTotal;
    private int cartItemCount;

    // ✅ Add user info
    private UUID userId;
    private String userEmail;
    private boolean hasLinkedUser;

    public static SessionResponse fromEntity(Session session) {
        List<CartItemResponse> cartItems = session.getCartItems() == null
                ? List.of()
                : session.getCartItems().stream()
                        .map(CartItemResponse::fromEntity)
                        .toList();

        BigDecimal cartTotal = cartItems.stream()
                .map(item -> item.getLineTotal())
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        int itemCount = cartItems.stream()
                .mapToInt(item -> item.getQuantity())
                .sum();

        return SessionResponse.builder()
                .success(true)
                .message("Session retrieved successfully")
                .sessionId(session.getId())
                .tableId(session.getTable().getId())
                .tableNumber(session.getTable().getTableNumber())
                .status(SessionStatus.ACTIVE)
                .guestCount(session.getGuestCount())
                .startedAt(session.getStartedAt())
                .cartItems(cartItems)
                .cartTotal(cartTotal)
                .cartItemCount(itemCount)
                .userId(session.getUser() != null ? session.getUser().getId() : null)
                .userEmail(session.getUser() != null ? session.getUser().getEmail() : null)
                .hasLinkedUser(session.getUser() != null)
                .build();
    }

    public static SessionResponse success(Session session) {
        return SessionResponse.fromEntity(session);
    }

    public static SessionResponse error(String message) {
        return SessionResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

}
