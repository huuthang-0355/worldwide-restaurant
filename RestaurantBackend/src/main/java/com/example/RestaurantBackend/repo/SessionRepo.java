package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.Session;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionRepo extends JpaRepository<Session, UUID> {

    Optional<Session> findByTableIdAndStatus(UUID tableId, SessionStatus status);

    boolean existsByTableIdAndStatus(UUID tableId, SessionStatus status);
}
