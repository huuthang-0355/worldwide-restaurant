package com.example.RestaurantBackend.service.momo;

import com.example.RestaurantBackend.dto.request.payment.MomoCallbackRequest;
import com.example.RestaurantBackend.dto.request.payment.MomoPaymentRequest;
import com.example.RestaurantBackend.dto.response.payment.MomoCallbackResponse;
import com.example.RestaurantBackend.dto.response.payment.MomoPaymentResponse;
import com.example.RestaurantBackend.dto.response.payment.PaymentStatusResponse;
import com.example.RestaurantBackend.model.Payment;

import java.util.UUID;

public interface MomoService {

    MomoPaymentResponse initiatePayment(MomoPaymentRequest request);
    MomoCallbackResponse handleCallback(MomoCallbackRequest request);
    PaymentStatusResponse queryMomoStatus(UUID paymentId);

    PaymentStatusResponse checkPaymentStatus(UUID paymentId);
}
