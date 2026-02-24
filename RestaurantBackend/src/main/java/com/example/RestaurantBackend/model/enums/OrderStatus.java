package com.example.RestaurantBackend.model.enums;

public enum OrderStatus {
    PENDING,
    ACCEPTED,
    IN_KITCHEN, // sent to kitcehn
    PREPARING,
    READY, // ready for pickup
    SERVED, // delivered to customer
    COMPLETED,
    CANCELLED
}
