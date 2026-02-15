package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.DataStatus;
import com.example.RestaurantBackend.model.Role;
import com.example.RestaurantBackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);

    List<User> findByRoleNot(Role role);

    List<User> findByRole(Role role);

    // Find active staff only
    List<User> findByRoleNotAndStatus(Role role, DataStatus status);
}
