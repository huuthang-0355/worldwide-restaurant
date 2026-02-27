package com.example.RestaurantBackend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "momo")
@Getter
@Setter
public class MomoConfig {

    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String endpoint;
    private String queryEndpoint;
    private String redirectUrl;
    private String ipnUrl;
    private String requestType;
    private boolean autoCapture;
    private String lang;

    @Bean
    public RestClient momoRestClient() {
        return RestClient.builder()
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
