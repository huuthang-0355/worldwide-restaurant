package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.payment.BillPreviewItemResponse;
import com.example.RestaurantBackend.dto.response.payment.BillPreviewResponse;
import com.example.RestaurantBackend.model.Session;
import com.example.RestaurantBackend.model.enums.OrderItemStatus;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import com.example.RestaurantBackend.model.order.Order;
import com.example.RestaurantBackend.model.order.OrderItem;
import com.example.RestaurantBackend.repo.SessionRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillService {

    private final SessionRepo sessionRepo;

    @Value("${restaurant.tax-rate:0.10}")
    private BigDecimal taxRate;

    @Value("${restaurant.service-charge-rate:0.05}")
    private BigDecimal serviceChargeRate;

    @Value("${payment.currency:VND}")
    private String currency;

    @Transactional
    public BillPreviewResponse previewBill(UUID sessionId) {
        // validate session
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if(session.getStatus() == SessionStatus.COMPLETED ||
        session.getStatus() == SessionStatus.CANCELLED) {
            return BillPreviewResponse.error("Session is already " + session.getStatus());
        }

        // get all non-cancelled orders
        List<Order> validOrders = session.getOrders().stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .toList();

        if(validOrders.isEmpty())
            return BillPreviewResponse.error("No orders found for this session");

        // build item list from orders
        List<BillPreviewItemResponse> billItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItemCount = 0;

        for(Order order : validOrders) {
            for(OrderItem item : order.getItems()) {
                // skip rejected items
                if(item.getStatus() == OrderItemStatus.REJECTED)
                    continue;

                List<String> modifiers = item.getSelectedModifiers() == null
                        ? List.of()
                        : item.getSelectedModifiers().stream()
                        .map(mod -> mod.getModifierName() + ": " + mod.getOptionName() +
                                " (+" + mod.getPriceAdjustment() + ")")
                        .toList();

                BillPreviewItemResponse billItem = BillPreviewItemResponse.builder()
                        .menuItemName(item.getMenuItem().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .modifiersPrice(item.getModifiersPrice())
                        .lineTotal(item.getLineTotal())
                        .modifiers(modifiers)
                        .specialInstructions(item.getSpecialInstructions())
                        .build();

                billItems.add(billItem);
                subtotal = subtotal.add(item.getLineTotal());
                totalItemCount += item.getQuantity();
            }
        }

        // calculate tax amount and service-charge
        BigDecimal taxAmount = subtotal.multiply(taxRate).setScale(0, RoundingMode.CEILING);
        BigDecimal serviceCharge = subtotal.multiply(serviceChargeRate).setScale(0, RoundingMode.CEILING);
        BigDecimal totalAmount = subtotal.add(taxAmount);
        totalAmount = totalAmount.add(serviceCharge);

        return BillPreviewResponse.builder()
                .success(true)
                .message("Bill preview generated successfully")
                .sessionId(sessionId)
                .tableNumber(session.getTable().getTableNumber())
                .guestCount(session.getGuestCount())
                .items(billItems)
                .totalItemCount(totalItemCount)
                .subtotal(subtotal)
                .taxRate(taxRate)
                .taxAmount(taxAmount)
                .serviceChargeRate(serviceChargeRate)
                .serviceCharge(serviceCharge)
                .totalAmount(totalAmount)
                .currency(currency)
                .orderCount(validOrders.size())
                .sessionStartedAt(session.getStartedAt())
                .build();
    }

    @Transactional
    public MessageResponse requestBill(UUID sessionId) {
        // validate session
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if(session.getStatus() != SessionStatus.ACTIVE)
            return MessageResponse.error("Session is not active. Current status: " + session.getStatus());

        // check if at least one order exists
        boolean hasOrders = session.getOrders().stream()
                .anyMatch(order -> order.getStatus() != OrderStatus.CANCELLED);

        if (!hasOrders) {
            return MessageResponse.error("No orders found for this session");
        }

        session.setStatus(SessionStatus.BILL_REQUESTED);
        sessionRepo.save(session);

        return MessageResponse.success("Bill requested successfully. A waiter will assist you shortly.");
    }
}
