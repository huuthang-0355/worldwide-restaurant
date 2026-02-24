package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.dto.request.StartSessionRequest;
import com.example.RestaurantBackend.dto.request.cart.AddCartItemRequest;
import com.example.RestaurantBackend.dto.request.cart.UpdateCartItemRequest;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.SessionResponse;
import com.example.RestaurantBackend.service.SessionService;
import com.sun.java.accessibility.util.GUIInitializedListener;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<?> startSession(@Valid @RequestBody StartSessionRequest request) {

        try {
            SessionResponse response = sessionService.startSession(request);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to start session " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable UUID id) {

        try {
            SessionResponse response = sessionService.getSessionById(id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }catch (Exception e) {
            return new ResponseEntity<>(MessageResponse.error("Failed to get session " + id
                    + " " + e.getMessage()), HttpStatus.BAD_REQUEST);
        }

    }

    @PostMapping("/{id}/cart/items")
    public ResponseEntity<?> addToCart(@PathVariable("id") UUID sessionId,
                                                     @Valid @RequestBody AddCartItemRequest request) {

        try {
            SessionResponse response = sessionService.addToCart(sessionId, request);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        }catch (Exception e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to add to cart " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }

    }

    @PutMapping("/{id}/cart/items/{itemId}")
    public ResponseEntity<?> updateCartItem(@PathVariable("id") UUID sessionId,
                                                          @PathVariable("itemId") UUID itemId,
                                                          @Valid @RequestBody UpdateCartItemRequest request) {
        try {
            SessionResponse response = sessionService.updateCartItem(sessionId, itemId, request);

            if(!response.isSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);

        }catch (Exception e) {
            return  new ResponseEntity<>(MessageResponse.error("Failed to update cart item  " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}/cart/items/{itemId}")
    public ResponseEntity<MessageResponse> removeCartItem(@PathVariable("id") UUID sessionId,
                                                          @PathVariable("itemId") UUID itemId) {
        try {
            MessageResponse response = sessionService.removeCartItem(sessionId, itemId);

            if(!response.getSuccess())
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

            return new ResponseEntity<>(response, HttpStatus.OK);
        }catch (Exception e) {

            return new ResponseEntity<>(MessageResponse.error("Failed to remove cart item " + e.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }
}
