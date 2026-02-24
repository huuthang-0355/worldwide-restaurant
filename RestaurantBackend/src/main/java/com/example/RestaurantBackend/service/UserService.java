package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.user.CreateStaffRequest;
import com.example.RestaurantBackend.dto.request.user.UpdateProfileRequest;
import com.example.RestaurantBackend.dto.request.user.UpdateStaffRequest;
import com.example.RestaurantBackend.dto.request.user.UpdateStatusRequest;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.StaffListResponse;
import com.example.RestaurantBackend.dto.response.UserResponse;
import com.example.RestaurantBackend.model.enums.DataStatus;
import com.example.RestaurantBackend.model.enums.Role;
import com.example.RestaurantBackend.model.User;
import com.example.RestaurantBackend.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CloudinaryService cloudinaryService;
    private final UserRepo userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private UserResponse mapToUserResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .emailVerified(user.getEmailVerified())
                .avatar(user.getAvatar())
                .status(user.getStatus())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserResponse getProfile(UUID userId) {

        try {
            Optional<User> optionalUser = userRepo.findById(userId);

            if(optionalUser.isEmpty())
                return null;

            User user = optionalUser.get();

            return mapToUserResponse(user);
        } catch (Exception e) {

            return null;
        }
    }

    public MessageResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        try {

            Optional<User> optionalUser = userRepo.findById(userId);

            if(optionalUser.isEmpty())
                return MessageResponse.error("User not found");

            User user = optionalUser.get();

            // update firstname
            if(request.getFirstName() != null && !request.getFirstName().isBlank())
                user.setFirstName(request.getFirstName().trim());

            // update lastname
            if(request.getLastName() != null && !request.getLastName().isBlank())
                user.setLastName(request.getLastName().trim());

            userRepo.save(user);

            return MessageResponse.success("Profile updated successfully");

        }catch (Exception e) {

            return MessageResponse.error("Failed to update profile: " + e.getMessage());
        }
    }

    // Upload user avatar
    public MessageResponse uploadAvatar(UUID userId, MultipartFile file) {
        try {
            if(file == null || file.isEmpty())
                return MessageResponse.error("No file provided");

            // validate filetype
            String fileType = file.getContentType();

            if(fileType == null || !ALLOWED_CONTENT_TYPES.contains(fileType))
                return MessageResponse.error("Invalid file format. Only JPG, PNG, and WebP are allowed");

            // validate filesize
            if(file.getSize() > MAX_FILE_SIZE)
                return MessageResponse.error("File size exceeds the limits of 5MB");

            // delete old avatar if exists
            Optional<User> optionalUser = userRepo.findById(userId);

            if(optionalUser.isEmpty())
                return MessageResponse.error("User not found");

            User user = optionalUser.get();

            if(user.getAvatar() != null && !user.getAvatar().isBlank()) {

                cloudinaryService.deletePhoto(user.getAvatar());
            }

            // upload new avatar to Cloud
            String avatarUrl = cloudinaryService.uploadPhoto(file);

            // save repo
            user.setAvatar(avatarUrl);
            userRepo.save(user);

            return MessageResponse.success("Avatar uploaded successfully");
        }catch (Exception e) {

            return MessageResponse.error("Failed to upload avatar: " + e.getMessage());
        }
    }

    // no email verification requird - admin create for staff
    public MessageResponse createStaff(CreateStaffRequest request) {

        try {
            // validate role
            if(request.getRole() == Role.CUSTOMER)
                return MessageResponse.error("Cannot create CUSTOMER via staff endpoint");

            // check if email already exists
            if(userRepo.existsByEmail(request.getEmail()))
                return MessageResponse.error("Email is already registered");

            // create staff user
            User staff = User.builder()
                    .email(request.getEmail())
                    .password(encoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .emailVerified(true) // harcode for true when admin create acc.
                    .role(request.getRole())
                    .status(DataStatus.ACTIVE)
                    .build();

            // save repo
            userRepo.save(staff);

            return MessageResponse.success("Staff account created successfully");
        }catch (Exception e) {

            return MessageResponse.error("Failed to create staff account: " + e.getMessage());
        }

    }

    // get all staff (excluding CUSTOMER)
    public StaffListResponse getAllStaff() {
        try {
            List<User> staffList = userRepo.findByRoleNot(Role.CUSTOMER);

            List<UserResponse> staffResponses = staffList.stream()
                    .map(user -> mapToUserResponse(user))
                    .collect(Collectors.toUnmodifiableList());

            return StaffListResponse.builder()
                    .success(true)
                    .message("Success")
                    .staff(staffResponses)
                    .total(staffResponses.size())
                    .build();

        }catch (Exception e) {

            return StaffListResponse.builder()
                    .success(false)
                    .message("Failed to fetch: " + e.getMessage())
                    .build();
        }
    }

    public UserResponse getStaffById(UUID staffId) {
        try {

            Optional<User> optionalStaff = userRepo.findById(staffId);

            if(optionalStaff.isEmpty())
                return null;

            User staff = optionalStaff.get();

            if(staff.getRole() == Role.CUSTOMER)
                return null;

            return mapToUserResponse(staff);

        }catch (Exception e) {

            return null;
        }
    }

    public MessageResponse updateStaff(UUID staffId, UpdateStaffRequest request) {
        try {

            Optional<User> optionalStaff = userRepo.findById(staffId);

            if(optionalStaff.isEmpty())
                return MessageResponse.error("Staff not found");

            User staff = optionalStaff.get();

            if(staff.getRole() == Role.CUSTOMER)
                return MessageResponse.error("Cannot update customer via staff endpoint");

            if(request.getFirstName() != null && !request.getFirstName().isBlank())
                staff.setFirstName(request.getFirstName());

            if(request.getLastName() != null && !request.getLastName().isBlank())
                staff.setLastName(request.getLastName());

            if(request.getRole() != null) {
                if(request.getRole() == Role.CUSTOMER)
                    return MessageResponse.error("Cannot change staff role to CUSTOMER");

                staff.setRole(request.getRole());
            }

            userRepo.save(staff);

            return MessageResponse.success("Staff account updated successfully");

        }catch (Exception e) {

            return MessageResponse.error("Failed to update staff member: " + e.getMessage());
        }
    }

    public MessageResponse updateStaffStatus(UUID staffId, UpdateStatusRequest request) {
        try {
            Optional<User> optionalStaff = userRepo.findById(staffId);

            if(optionalStaff.isEmpty())
                return MessageResponse.error("Staff not found");

            User staff = optionalStaff.get();

            if(staff.getRole() == Role.CUSTOMER)
                return MessageResponse.error("Cannot update customer via staff endpoint");

            staff.setStatus(request.getStatus());
            userRepo.save(staff);

            String statusText = request.getStatus() == DataStatus.ACTIVE ? "activated" : "deactivated";
            return MessageResponse.success("Staff account " + statusText + " successfully");

        } catch (Exception e) {

            return MessageResponse.error("Failed to update staff status: " + e.getMessage());
        }
    }

}
