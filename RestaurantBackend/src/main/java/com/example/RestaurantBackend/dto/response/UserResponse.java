package com.example.RestaurantBackend.dto.response;

import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL) // it means when converting object into json, ignore (don't show) null fields.
public class UserResponse {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Boolean emailVerified;
    private String avatar;
    private DataStatus status;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
