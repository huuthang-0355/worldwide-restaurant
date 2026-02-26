package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, UUID> {

    Optional<OrderItem> findByIdAndOrderId(UUID itemId, UUID orderId);

}
