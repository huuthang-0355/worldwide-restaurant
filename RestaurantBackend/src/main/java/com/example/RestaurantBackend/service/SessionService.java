package com.example.RestaurantBackend.service;

import com.example.RestaurantBackend.dto.request.StartSessionRequest;
import com.example.RestaurantBackend.dto.request.cart.AddCartItemRequest;
import com.example.RestaurantBackend.dto.request.cart.UpdateCartItemRequest;
import com.example.RestaurantBackend.dto.response.MenuAccessResponse;
import com.example.RestaurantBackend.dto.response.MessageResponse;
import com.example.RestaurantBackend.dto.response.SessionResponse;
import com.example.RestaurantBackend.model.*;
import com.example.RestaurantBackend.model.enums.DataStatus;
import com.example.RestaurantBackend.model.enums.MenuItemStatus;
import com.example.RestaurantBackend.model.enums.SessionStatus;
import com.example.RestaurantBackend.repo.*;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final QrTokenService qrTokenService;
    private final JwtService jwtService;
    private final SessionRepo sessionRepo;
    private final TableRepo tableRepo;
    private final MenuItemRepo menuItemRepo;
    private final UserRepo userRepo;
    private final ModifierOptionRepo modifierOptionRepo;
    private final CartItemRepo cartItemRepo;

    @Transactional
    public SessionResponse startSession(StartSessionRequest request, String authHeader) {
        // validate QR token
        Claims claims =  qrTokenService.validateToken(request.getToken());

        if(claims == null)
            return SessionResponse.error("Invalid QR Code");

        UUID tableId = UUID.fromString(claims.get("tableId", String.class));

        // chekc if table already has an active session
        if(sessionRepo.existsByTableIdAndStatus(tableId, SessionStatus.ACTIVE)) {
            Session existingSession = sessionRepo.findByTableIdAndStatus(tableId, SessionStatus.ACTIVE)
                    .orElseThrow(() -> new RuntimeException("Session state inconsistency"));

            return SessionResponse.success(existingSession);
        }

        // find table entity
        Table table = tableRepo.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        User user = null;
        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);

            user = userRepo.findByEmail(email)
                    .orElse(null);
        }


        // create new session
        Session session = Session.builder()
                .table(table)
                .status(SessionStatus.ACTIVE)
                .user(user)
                .guestCount(request.getGuestCount())
                .startedAt(LocalDateTime.now())
                .cartItems(new ArrayList<>())
                .orders(new ArrayList<>())
                .build();

        sessionRepo.save(session);

        return SessionResponse.success(session);
    }

    @Transactional
    public SessionResponse getSessionById(UUID sessionId) {
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        return SessionResponse.fromEntity(session);
    }

    @Transactional
    public SessionResponse addToCart(UUID sessionId, AddCartItemRequest request) {
        // validate session
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if(session.getStatus() != SessionStatus.ACTIVE) {
            return SessionResponse.error("Session is not ACTIVE");
        }

        // validate menu item
        MenuItem menuItem = menuItemRepo.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if(menuItem.getStatus() != MenuItemStatus.AVAILABLE)
            return SessionResponse.error("Menu item is not AVAILABLE");

        // calculate prices
        BigDecimal unitPrice = menuItem.getPrice();
        BigDecimal modifiersPrice = BigDecimal.ZERO;

        List<CartItemModifier> modifiers = new ArrayList<>();

        if(request.getModifierOptionIds() != null && !request.getModifierOptionIds().isEmpty()) {
            List<ModifierOption> optionList = modifierOptionRepo
                    .findAllById(request.getModifierOptionIds());

            for(ModifierOption option : optionList) {
                if(option.getStatus() != DataStatus.ACTIVE)
                    return SessionResponse.error("Modifier option " + option.getName() + " is not available");

                modifiersPrice = modifiersPrice.add(option.getPriceAdjustment());


                // being saved with CartItem cascade
                CartItemModifier modifier = CartItemModifier.builder()
                        .cartItem(null)
                        .modifierOption(option)
                        .modifierGroupName(option.getGroup().getName())
                        .optionName(option.getName())
                        .priceAdjustment(option.getPriceAdjustment())
                        .build();

                modifiers.add(modifier);
            }

        }

        // create cart item
        CartItem cartItem = CartItem.builder()
                .session(session)
                .menuItem(menuItem)
                .quantity(request.getQuantity())
                .specialInstructions(request.getSpecialInstructions())
                .unitPrice(unitPrice)
                .modifiersPrice(modifiersPrice)
                .selectedModifiers(modifiers)
                .build();

        // set cart item reference for each modifier
        modifiers.forEach(modifier -> modifier.setCartItem(cartItem));

        // save cart item
        cartItemRepo.save(cartItem);

        // reload session with updated cart
        session.getCartItems().add(cartItem);
        sessionRepo.save(session);

        session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return SessionResponse.success(session);
    }

    @Transactional
    public SessionResponse updateCartItem(UUID sessionId, UUID cartItemId, UpdateCartItemRequest request) {
        // validate session
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if(session.getStatus() != SessionStatus.ACTIVE)
            return SessionResponse.error("Session is not ACTIVE");

        // find cart item
        CartItem cartItem = cartItemRepo.findByIdAndSessionId(cartItemId, sessionId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // update quantity and instruction if provided
        if(request.getQuantity() != null) cartItem.setQuantity(request.getQuantity());
        if(request.getSpecialInstructions() != null) cartItem.setSpecialInstructions(
                request.getSpecialInstructions()
        );

        // update modifiers if provided
        if(request.getModifierOptionIds() != null) {
            // clear existing modifiers
            cartItem.getSelectedModifiers().clear();

            BigDecimal modifiersPrice = BigDecimal.ZERO;

            if(!request.getModifierOptionIds().isEmpty()) {
                List<ModifierOption> optionList = modifierOptionRepo.findAllById(request.getModifierOptionIds());

                for(ModifierOption option : optionList) {
                    if(option.getStatus() != DataStatus.ACTIVE)
                        return SessionResponse.error("Modifier option " + option.getName() + " is not ACTIVE");

                    modifiersPrice = modifiersPrice.add(option.getPriceAdjustment());

                    CartItemModifier modifier = CartItemModifier.builder()
                            .cartItem(cartItem)
                            .modifierOption(option)
                            .modifierGroupName(option.getGroup().getName())
                            .optionName(option.getName())
                            .priceAdjustment(option.getPriceAdjustment())
                            .build();

                    cartItem.getSelectedModifiers().add(modifier);
                }
            }

            cartItem.setModifiersPrice(modifiersPrice);
        }

        cartItemRepo.save(cartItem);

        // reload session
        session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return SessionResponse.success(session);
    }

    @Transactional
    public MessageResponse removeCartItem(UUID sessionId, UUID cartItemId) {
        // validate session
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if(session.getStatus() != SessionStatus.ACTIVE)
            return MessageResponse.error("Session is not ACTIVE");

        // find cart item and delete
        CartItem cartItem = cartItemRepo.findByIdAndSessionId(cartItemId, sessionId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cartItemRepo.delete(cartItem);

        return MessageResponse.success("Item removed from cart successfully");
    }

    @Transactional
    public SessionResponse linkUserToSession(UUID sessionId, String authHeader) {
        try {

            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            User user = userRepo.findByEmail(email)
                    .orElse(null);

            Session session = sessionRepo.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            // Check if session is still active
            if (session.getStatus() != SessionStatus.ACTIVE
                    && session.getStatus() != SessionStatus.BILL_REQUESTED
                    && session.getStatus() != SessionStatus.PAYMENT_PENDING) {
                return SessionResponse.error("Cannot link user to completed or cancelled session");
            }

            // Check if session already has a different user
            if (session.getUser() != null
                    && user != null
                    && !session.getUser().getId().equals(user.getId())
            ) {
                return SessionResponse.error("Session is already linked to another user");
            }

            // If already linked to same user, just return success
            if (session.getUser() != null
                    && user != null
                    && session.getUser().getId().equals(user.getId())) {
                return SessionResponse.success(session);
            }

            session.setUser(user);
            session = sessionRepo.save(session);

            return SessionResponse.success(session);

        } catch (Exception e) {

            return SessionResponse.error("Failed to link user: " + e.getMessage());
        }
    }
}
