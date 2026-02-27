package com.example.RestaurantBackend.repo;

import com.example.RestaurantBackend.model.Payment;
import com.example.RestaurantBackend.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, UUID> {
    Optional<Payment> findBySessionId(UUID sessionId);

    Optional<Payment> findByPaymentReference(String paymentReference);

    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);

    Optional<Payment> findBySessionIdAndStatus(UUID sessionId, PaymentStatus status);

    Optional<Payment> findByGatewayRequestId(String gatewayRequestId);

    boolean existsByPaymentReference(String paymentReference);

}
