package com.example.RestaurantBackend.controller;

import com.example.RestaurantBackend.service.RealtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/realtime")
@RequiredArgsConstructor
public class RealtimeController {

    private final RealtimeService realtimeService;

    /**
     * Expose SSE stream for Admin/Staff (Dashboard, Orders, KDS)
     */
    @GetMapping(value = "/admin/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN_STAFF', 'WAITER')")
    public SseEmitter streamAdminEvents() {
        log.info("Admin connected to real-time event stream");
        return realtimeService.registerAdminEmitter();
    }

    /**
     * Expose SSE stream for Dining Customers based on their Table/Session ID
     */
    @GetMapping(value = "/customer/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamCustomerEvents(@RequestParam("sessionId") UUID sessionId) {
        log.info("Customer connected to real-time event stream, session ID: {}", sessionId);
        return realtimeService.registerCustomerEmitter(sessionId);
    }
}
