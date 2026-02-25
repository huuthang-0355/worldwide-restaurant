package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.UpdateOrderStatusRequest;
import com.example.RestaurantBackend.dto.response.kds.KdsOrderItemResponse;
import com.example.RestaurantBackend.dto.response.kds.KdsOrderListResponse;
import com.example.RestaurantBackend.dto.response.kds.KdsOrderResponse;
import com.example.RestaurantBackend.dto.response.kds.KdsStatsResponse;
import com.example.RestaurantBackend.dto.response.order.OrderListResponse;
import com.example.RestaurantBackend.dto.response.order.OrderResponse;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.service.KitchenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF')")
public class KitchenController {

    private final KitchenService kitchenService;

    @GetMapping("/orders")
    public ResponseEntity<KdsOrderListResponse> getKitchenOrders(
            @RequestParam(required = false) OrderStatus status
    ) {
        try {
            KdsOrderListResponse response = kitchenService.getKitchenOrders(status);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<KdsOrderResponse> getOrderById(@PathVariable("id") UUID orderId) {
        try {
            KdsOrderResponse response = kitchenService.getKitchenOrderById(orderId);

            if(response == null)
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable("id") UUID orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        try {
            OrderResponse response = kitchenService.updateOrderStatus(orderId, request);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/orders/stats")
    public ResponseEntity<KdsStatsResponse> getOrderStats() {
        try {
            KdsStatsResponse response = kitchenService.getOrderStats();

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
