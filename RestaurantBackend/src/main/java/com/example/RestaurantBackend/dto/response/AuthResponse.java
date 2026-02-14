package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private Boolean success;
    private String message;
    private String token;
    private String tokenType;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Boolean emailVerified;

}
