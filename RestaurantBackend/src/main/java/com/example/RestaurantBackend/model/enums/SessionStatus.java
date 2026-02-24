package com.example.RestaurantBackend.model.enums;

public enum SessionStatus {
    ACTIVE, //
    BILL_REQUESTED, // Guest request the bill
    PAYMENT_PENDING,
    COMPLETED,
    CANCELLED
}
