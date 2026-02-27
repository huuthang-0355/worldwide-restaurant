package com.example.RestaurantBackend.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

public class MomoSecurityUtil {

    private MomoSecurityUtil() {

    }

    // Generate HMAC SHA256 signature
    public static String signHmacSHA256(String data, String secretKey) {
        try {
            Mac hmacSHA256 = Mac.getInstance("HmacSHA256");

            SecretKeySpec keySpec = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );

            hmacSHA256.init(keySpec);

            byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA256 signature", e);
        }
    }

    // Verify MoMo callback signature
    public static boolean verifySignature(String rawData, String signature, String secretKey) {
        String expectedSignature = signHmacSHA256(rawData, secretKey);

        return expectedSignature.equals(signature);
    }
}
