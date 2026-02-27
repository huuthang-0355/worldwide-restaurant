package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.momo.MomoCreatePaymentResponse;
import com.example.RestaurantBackend.dto.request.payment.MomoCallbackRequest;
import com.example.RestaurantBackend.dto.request.payment.MomoPaymentRequest;
import com.example.RestaurantBackend.dto.response.payment.MomoCallbackResponse;
import com.example.RestaurantBackend.dto.response.payment.MomoPaymentResponse;
import com.example.RestaurantBackend.dto.response.payment.PaymentStatusResponse;
import com.example.RestaurantBackend.service.momo.MomoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
public class MomoController {

    private final MomoService momoService;

    @PostMapping("/initiate")
    public ResponseEntity<MomoPaymentResponse> initiatePayment(
            @Valid @RequestBody MomoPaymentRequest request
    ) {

        try {
            MomoPaymentResponse response = momoService.initiatePayment(request);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        }catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/callback")
    public ResponseEntity<MomoCallbackResponse> handleCallback(
            @Valid @RequestBody MomoCallbackRequest request
    ) {
        try {
            MomoCallbackResponse response = momoService.handleCallback(request);

            // always return 200 OK to prevent IPN spam
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.OK);
        }
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<PaymentStatusResponse> checkPaymentStatus(@PathVariable("id") UUID paymentId) {
        try {
            PaymentStatusResponse response = momoService.checkPaymentStatus(paymentId);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<PaymentStatusResponse> verifyPayment(@PathVariable("id") UUID paymentId) {
        try {
            PaymentStatusResponse response = momoService.queryMomoStatus(paymentId);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
