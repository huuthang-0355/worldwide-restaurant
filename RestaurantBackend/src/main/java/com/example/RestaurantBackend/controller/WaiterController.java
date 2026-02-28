package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.OrderFilterRequest;
import com.example.RestaurantBackend.dto.request.RejectItemRequest;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.bill_request.BillRequestListResponse;
import com.example.RestaurantBackend.dto.response.order.OrderListResponse;
import com.example.RestaurantBackend.dto.response.order.OrderResponse;
import com.example.RestaurantBackend.dto.response.pending_order.PendingOrderListResponse;
import com.example.RestaurantBackend.model.enums.OrderStatus;
import com.example.RestaurantBackend.service.WaiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'WAITER')")
public class WaiterController {

    private final WaiterService waiterService;


    /**
     * Get all orders with optional filters
     *
     * @param status Filter by order status (optional)
     * @param sortBy Field to sort by: createdAt, totalAmount, orderNumber (default: createdAt)
     * @param sortDirection Sort direction: ASC, DESC (default: DESC)
     */
    @GetMapping("/orders")
    public ResponseEntity<OrderListResponse> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection
    ) {
        try {

            OrderFilterRequest filter = OrderFilterRequest.builder()
                    .status(status)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            OrderListResponse response = waiterService.getAllOrders(filter);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {

            return new ResponseEntity<>(
                    OrderListResponse.error("Failed to retrieve orders: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<PendingOrderListResponse> getPendingOrders() {
        try {
            PendingOrderListResponse response = waiterService.getPendingOrders();

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);

        }catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/orders/{orderId}/items/{itemId}/accept")
    public ResponseEntity<?> acceptOrderItem(@PathVariable UUID orderId,
                                             @PathVariable UUID itemId) {
        try {
            OrderResponse response = waiterService.acceptOrderItem(orderId, itemId);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to accept order item " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/orders/{orderId}/items/{itemId}/reject")
    public ResponseEntity<?> rejectOrderItem(@PathVariable UUID orderId,
                                             @PathVariable UUID itemId,
                                             @Valid @RequestBody RejectItemRequest request) {
        try {
            OrderResponse response = waiterService.rejectOrderItem(orderId, itemId, request);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to reject order item " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/orders/{orderId}/send-to-kitchen")
    public ResponseEntity<?> sendToKitchen(@PathVariable UUID orderId) {
        try {
            OrderResponse response = waiterService.sendToKitchen(orderId);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to send to kitchen " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/orders/{orderId}/served")
    public ResponseEntity<?> markAsServed(@PathVariable UUID orderId) {
        try {
            OrderResponse response = waiterService.markAsServed(orderId);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        }catch (Exception e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to mark served " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/bill-requests")
    public ResponseEntity<BillRequestListResponse> getBillRequests() {
        try {
            BillRequestListResponse response = waiterService.getBillRequests();

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
