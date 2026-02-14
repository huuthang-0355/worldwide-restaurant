package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.model.User;

public interface EmailService {
    void sendVerificationEmail(User user, String token);
    void sendPasswordResetEmail(User user, String token);
}
