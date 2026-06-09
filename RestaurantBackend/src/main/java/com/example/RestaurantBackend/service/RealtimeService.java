package com.example.RestaurantBackend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
public class RealtimeService {

    // Emitters for admin/waiter/KDS dashboards
    private final List<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();

    // Emitters for customer sessions (sessionId -> list of emitters)
    private final Map<UUID, List<SseEmitter>> customerEmitters = new ConcurrentHashMap<>();

    private final ExecutorService executor = Executors.newCachedThreadPool();

    private static final Long EMITTER_TIMEOUT = 180000L; // 3 minutes

    /**
     * Register a new admin/staff emitter
     */
    public SseEmitter registerAdminEmitter() {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);

        emitter.onCompletion(() -> adminEmitters.remove(emitter));
        emitter.onTimeout(() -> adminEmitters.remove(emitter));
        emitter.onError((ex) -> adminEmitters.remove(emitter));

        adminEmitters.add(emitter);

        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("Connected to Admin Stream"));
        } catch (IOException e) {
            adminEmitters.remove(emitter);
            log.error("Failed to send connection message to admin emitter", e);
        }

        return emitter;
    }

    /**
     * Register a new customer emitter for a specific dining session
     */
    public SseEmitter registerCustomerEmitter(UUID sessionId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);

        emitter.onCompletion(() -> removeCustomerEmitter(sessionId, emitter));
        emitter.onTimeout(() -> removeCustomerEmitter(sessionId, emitter));
        emitter.onError((ex) -> removeCustomerEmitter(sessionId, emitter));

        customerEmitters.computeIfAbsent(sessionId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("Connected to Customer Stream for session " + sessionId));
        } catch (IOException e) {
            removeCustomerEmitter(sessionId, emitter);
            log.error("Failed to send connection message to customer emitter, session: {}", sessionId, e);
        }

        return emitter;
    }

    private void removeCustomerEmitter(UUID sessionId, SseEmitter emitter) {
        List<SseEmitter> emitters = customerEmitters.get(sessionId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                customerEmitters.remove(sessionId);
            }
        }
    }

    /**
     * Broadcast an event to all connected admin/staff emitters
     */
    public void broadcastToAdmins(String eventName, Object data) {
        executor.submit(() -> {
            List<SseEmitter> deadEmitters = new ArrayList<>();

            for (SseEmitter emitter : adminEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                    log.warn("Failed sending SSE to admin emitter, registering for removal");
                }
            }

            if (!deadEmitters.isEmpty()) {
                adminEmitters.removeAll(deadEmitters);
            }
        });
    }

    /**
     * Broadcast an event to all connected customer emitters in a specific dining session
     */
    public void broadcastToCustomerSession(UUID sessionId, String eventName, Object data) {
        executor.submit(() -> {
            List<SseEmitter> emitters = customerEmitters.get(sessionId);
            if (emitters == null || emitters.isEmpty()) {
                return;
            }

            List<SseEmitter> deadEmitters = new ArrayList<>();

            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                    log.warn("Failed sending SSE to customer emitter for session {}, registering for removal", sessionId);
                }
            }

            if (!deadEmitters.isEmpty()) {
                emitters.removeAll(deadEmitters);
                if (emitters.isEmpty()) {
                    customerEmitters.remove(sessionId);
                }
            }
        });
    }
}
