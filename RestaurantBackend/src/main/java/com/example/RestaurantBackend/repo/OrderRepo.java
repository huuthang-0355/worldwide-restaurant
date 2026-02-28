package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepo extends JpaRepository<Order, UUID> {

    List<Order> findBySessionIdOrderByCreatedAtDesc(UUID sessionId);

    List<Order> findByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);

    boolean existsByOrderNumber(String orderNumber);

    long countByStatus(OrderStatus status);

    long countByStatusIn(List<OrderStatus> statuses);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findBySessionIdInOrderByCreatedAtDesc(List<UUID> sessionIds);
}
