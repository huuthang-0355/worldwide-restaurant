package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.auth.*;
import com.example.RestaurantBackend.dto.request.user.UpdatePasswordRequest;
import com.example.RestaurantBackend.dto.response.AuthResponse;
import com.example.RestaurantBackend.dto.response.CheckEmailResponse;
import com.example.RestaurantBackend.dto.response.LoginResponse;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.model.UserPrincipal;
import com.example.RestaurantBackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        MessageResponse response = authService.register(request);

        if(response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);

        if(response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.OK);

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        MessageResponse response = authService.verifyEmail(request);

        if(response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.OK);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }


    // used for real time validation in registration form
    @GetMapping("/check-email")
    public ResponseEntity<CheckEmailResponse> checkEmail(@RequestParam String email) {
        CheckEmailResponse response = authService.checkEmailAvailability(email);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.forgotPassword(request);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);

        if(response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.OK);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/update-password")
    public ResponseEntity<MessageResponse> updatePassword(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody UpdatePasswordRequest request) {
        MessageResponse response = authService.updatePassword(principal.getUser().getId(), request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}