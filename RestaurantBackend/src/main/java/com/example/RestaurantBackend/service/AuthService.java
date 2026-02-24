package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.auth.*;
import com.example.RestaurantBackend.dto.request.user.UpdatePasswordRequest;
import com.example.RestaurantBackend.dto.response.AuthResponse;
import com.example.RestaurantBackend.dto.response.CheckEmailResponse;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.model.enums.Role;
import com.example.RestaurantBackend.model.User;
import com.example.RestaurantBackend.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.token.verification-expiry-hours:24}")
    private int verificationTokenExpiryHours;

    @Value("${app.token.password-reset-expiry-hours:1}")
    private int passwordResetExpiryHours;

    // random token (not jwt token) for email verification
    private String generateToken() {

        return UUID.randomUUID().toString().replace("-", "");
    }


    // register for only customer and admin
    public MessageResponse register(RegisterRequest request) {

        try {

            if(!request.getPassword().equals(request.getConfirmPassword()))
                return MessageResponse.error("Passwords do not match");

            // validate role
            if(!request.getRole().equals(String.valueOf(Role.CUSTOMER)) &&
                    !request.getRole().equals(String.valueOf(Role.ADMIN))) {
                return MessageResponse.error("Only CUSTOMER and ADMIN can register. Staff accounts are created by ADMIN");
            }

            // check if email already exists
            if(userRepo.existsByEmail(request.getEmail().toLowerCase().trim()))
                return MessageResponse.error("Email is already registered");

            // generate verification token
            String verificationToken = this.generateToken();
            LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(verificationTokenExpiryHours);

            // create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(encoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setRole(Role.valueOf(request.getRole()));
            user.setEmailVerificationToken(verificationToken);
            user.setVerificationTokenExpiry(tokenExpiry);

            userRepo.save(user);

            // send verification email
            emailService.sendVerificationEmail(user, verificationToken);

            return MessageResponse.success("Registration successful. Please check your email to verify your account.");
        }catch (Exception e) {

            return MessageResponse.error("Registration failed: " + e.getMessage());
        }

    }

    // authenticate user and return jwt token
    // block unverified customer and admin
    public AuthResponse login(LoginRequest request) {

        try {
            // find user by email
            Optional<User> optionalUser = userRepo.findByEmail(request.getEmail());

            if(optionalUser.isEmpty()) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Invalid email or password")
                        .build();
            }

            User user = optionalUser.get();

            // verify password (plain, hashed)
            if(!encoder.matches(request.getPassword(), user.getPassword())) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Invalid email or password")
                        .build();
            }

            // check email verification for customer or admin
            if((user.getRole() == Role.CUSTOMER || user.getRole() == Role.ADMIN)
                    && !user.getEmailVerified()) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Please verify your email before logging")
                        .build();
            }

            // generate JWT token
            String token = jwtService.generateToken(user);

            // return
            return AuthResponse.builder()
                    .success(true)
                    .message("Login successfully")
                    .token(token)
                    .tokenType("Bearer")
                    .email(user.getEmail())
                    .userId(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role(user.getRole())
                    .emailVerified(user.getEmailVerified())
                    .build();
        }catch (Exception e) {

            return AuthResponse.builder()
                    .success(false)
                    .message("Login failed: " + e.getMessage())
                    .build();
        }

    }

    // verify email using token sent to user's email
    public MessageResponse verifyEmail(VerifyEmailRequest request) {

        try {
            // find user by verification token
            Optional<User> optionalUser = userRepo.findByEmailVerificationToken(request.getToken());

            if(optionalUser.isEmpty())
                return MessageResponse.error("Invalid verification token");


            User user = optionalUser.get();

            // check if the token has expired
            if(user.getVerificationTokenExpiry() == null ||
                    LocalDateTime.now().isAfter(user.getVerificationTokenExpiry())) {

                return MessageResponse.error("Verification token has expired. Please request a new one");
            }

            // activate the account
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setVerificationTokenExpiry(null);

            userRepo.save(user);

            return MessageResponse.success("Email verified successfully. You can log in.");
        }catch (Exception e) {

            return MessageResponse.error("Email verification failed: " + e.getMessage());
        }
    }

    public CheckEmailResponse checkEmailAvailability(String email) {
        try {
            if(email == null || email.isEmpty())
                return new CheckEmailResponse(false, "Email is required");

            boolean exists = userRepo.existsByEmail(email);

            if(exists)
                return CheckEmailResponse.taken();

            return CheckEmailResponse.available();
        }catch (Exception e) {

            return new CheckEmailResponse(false, "Error checking email: " + e.getMessage());
        }

    }

    // Sends password reset email if user exists.
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        try {
            String genericMessage = "If an account with that email exists, a password reset link has been sent.";

            // check user exists
            Optional<User> optionalUser = userRepo.findByEmail(request.getEmail().toLowerCase().trim());

            if(optionalUser.isEmpty())
                // not revealing that email doesn't exist
                return MessageResponse.success(genericMessage);

            User user = optionalUser.get();

            // generate password reset token
            String resetToken = this.generateToken();
            LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(this.passwordResetExpiryHours);

            // set in db
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetExpires(tokenExpiry);
            userRepo.save(user);

            // send password reset email
            emailService.sendPasswordResetEmail(user, resetToken);

            return MessageResponse.success(genericMessage);

        } catch (Exception e) {
            return MessageResponse.success("If an account with that email exists, a password reset link has been sent.");
        }

    }

    // Validates token and updates password.
    public MessageResponse resetPassword(ResetPasswordRequest request) {

        try {
            // find user by reset token
            Optional<User> optionalUser = userRepo.findByPasswordResetToken(request.getToken());

            if(optionalUser.isEmpty())
                return MessageResponse.error("Invalid or expired reset token");

            User user = optionalUser.get();

            // check if token has expired
            if(user.getPasswordResetExpires() == null ||
                    LocalDateTime.now().isAfter(user.getPasswordResetExpires())) {

                // clear expired token
                user.setPasswordResetToken(null);
                user.setPasswordResetExpires(null);
                userRepo.save(user);

                return MessageResponse.error("Reset token has expired. Please request a new password reset.");
            }

            // update password
            user.setPassword(encoder.encode(request.getNewPassword()));

            // clear reset token
            user.setPasswordResetToken(null);
            user.setPasswordResetExpires(null);

            userRepo.save(user);

            return MessageResponse.success("Password reset successful. You can now log in with your new password.");
        }catch (Exception e) {

            return MessageResponse.error("Password reset failed: " + e.getMessage());
        }

    }

    // update password
    public MessageResponse updatePassword(UUID userId, UpdatePasswordRequest request) {
        try {

            // validate password confirmation
            if(!request.getNewPassword().equals(request.getConfirmPassword()))
                return MessageResponse.error("New passwords do not match");

            // find user
            Optional<User> optionalUser = userRepo.findById(userId);

            if(optionalUser.isEmpty())
                return MessageResponse.error("User not found");

            User user = optionalUser.get();

            // verify current password
            if(!encoder.matches(request.getCurrentPassword(), user.getPassword()))
                return MessageResponse.error("Current password is incorrect");

            // check if new password is the same as old
            if(encoder.matches(request.getNewPassword(), user.getPassword()))
                return MessageResponse.error("New password must be different from current password");

            // update password
            user.setPassword(encoder.encode(request.getNewPassword()));
            userRepo.save(user);

            return MessageResponse.success("Password updated successfully");
        } catch (Exception e) {

            return MessageResponse.error("Failed to update password: " + e.getMessage());
        }
    }

}
