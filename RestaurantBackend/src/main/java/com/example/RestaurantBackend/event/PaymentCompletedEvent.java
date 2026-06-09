package com.example.RestaurantBackend.event;

import com.example.RestaurantBackend.model.Payment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PaymentCompletedEvent extends ApplicationEvent {
    private final Payment payment;

    public PaymentCompletedEvent(Object source, Payment payment) {
        super(source);
        this.payment = payment;
    }
}
