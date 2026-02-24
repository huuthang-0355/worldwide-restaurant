package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, UUID> {
    List<CartItem> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

    Optional<CartItem> findByIdAndSessionId(UUID id, UUID sessionId);

    void deleteBySessionId(UUID sessionId);
}
