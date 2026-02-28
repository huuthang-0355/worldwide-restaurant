package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.user.CreateStaffRequest;
import com.example.RestaurantBackend.dto.request.user.UpdateProfileRequest;
import com.example.RestaurantBackend.dto.request.user.UpdateStaffRequest;
import com.example.RestaurantBackend.dto.request.user.UpdateStatusRequest;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.OrderHistoryResponse;
import com.example.RestaurantBackend.dto.response.StaffListResponse;
import com.example.RestaurantBackend.dto.response.UserResponse;
import com.example.RestaurantBackend.model.UserPrincipal;
import com.example.RestaurantBackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponse response = userService.getProfile(principal.getUser().getId());

        if(response == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/profile")
    public ResponseEntity<MessageResponse> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                         @Valid @RequestBody UpdateProfileRequest request) {
        MessageResponse response = userService.updateProfile(principal.getUser().getId(),
                request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping(value = "/avatar", consumes = "multipart/form-data")
    public ResponseEntity<MessageResponse> uploadAvatar(@AuthenticationPrincipal UserPrincipal principal,
                                                        @RequestParam("photo") MultipartFile file) {
        MessageResponse response = userService.uploadAvatar(principal.getUser().getId(), file);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/order-history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderHistoryResponse> getOrderHistory(
            @RequestHeader(value = "Authorization") String authHeader
    ) {
        try {
            OrderHistoryResponse response = userService.getOrderHistory(authHeader);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        MessageResponse response = userService.createStaff(request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffListResponse> getAllStaff() {
        StaffListResponse response = userService.getAllStaff();

        if(!response.isSuccess())
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getStaffById(@PathVariable UUID id) {
        UserResponse response = userService.getStaffById(id);

        if(response == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateStaff(@PathVariable UUID id,
                                                       @Valid @RequestBody UpdateStaffRequest request) {
        MessageResponse response = userService.updateStaff(id, request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/staff/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateStaffStatus(@PathVariable UUID id,
                                                             @Valid @RequestBody UpdateStatusRequest request) {
        MessageResponse response = userService.updateStaffStatus(id, request);

        if(!response.getSuccess())
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
