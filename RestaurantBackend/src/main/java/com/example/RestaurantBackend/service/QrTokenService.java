package com.example.RestaurantBackend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class QrTokenService {

    @Value("${app.qr.secret}")
    private String qrSecret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(qrSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateTableToken(UUID tableId, String tableNumber) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tableId", tableId.toString());
        claims.put("tableNumber", tableNumber);
        claims.put("createdAt", System.currentTimeMillis());

        return Jwts.builder()
                .claims(claims)
                .subject(tableId.toString())
                .issuedAt(new Date())
                .signWith(getSigningKey())
                .compact();
    }

    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    public UUID extractTableId(String token) {
        Claims claims = validateToken(token);

        if(claims == null) return null;

        String tableId = claims.get("tableId", String.class);

        return tableId != null ? UUID.fromString(tableId) : null;
    }

    public String extractTableNumber(String token) {
        Claims claims = validateToken(token);
        if (claims == null) {
            return null;
        }
        return claims.get("tableNumber", String.class);
    }

    public boolean isValidateToken(String token) {

        return validateToken(token) != null;
    }

}
