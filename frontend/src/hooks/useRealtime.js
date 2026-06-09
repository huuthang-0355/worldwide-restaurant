import { useEffect, useState, useRef } from "react";
import { API_BASE_URL, STORAGE_KEYS } from "../constants/api";

/**
 * useRealtime - Custom React hook to establish Server-Sent Events (SSE) connections
 * 
 * @param {string} url - Relative path (e.g., "/realtime/admin/stream") or absolute URL
 * @param {Object} eventHandlers - Map of event names to callback functions (e.g., { "new-order": (data) => {} })
 * @param {boolean} enabled - Toggle connection on/off (default: true)
 */
export function useRealtime(url, eventHandlers = {}, enabled = true) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    
    // Store handlers in a ref to avoid stale closures in EventSource listeners
    const handlersRef = useRef(eventHandlers);
    useEffect(() => {
        handlersRef.current = eventHandlers;
    });

    const eventNamesKey = Object.keys(eventHandlers).join(",");

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // 1. Resolve full URL
        let fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

        // 2. Append auth token for admin/staff streams since EventSource doesn't support custom headers
        if (url.includes("/admin")) {
            const token = localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);
            if (token) {
                fullUrl += `${fullUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
            }
        }

        let eventSource;
        try {
            console.log(`[useRealtime] Connecting to SSE: ${url}`);
            eventSource = new EventSource(fullUrl);

            // Connection established listener
            eventSource.addEventListener("connect", () => {
                console.log("[useRealtime] Connection established");
                setIsConnected(true);
                setError(null);
            });

            // Register all custom event handlers (referenced via handlersRef)
            Object.keys(eventHandlers).forEach((eventName) => {
                eventSource.addEventListener(eventName, (event) => {
                    try {
                        const parsedData = JSON.parse(event.data);
                        if (handlersRef.current[eventName]) {
                            handlersRef.current[eventName](parsedData);
                        }
                    } catch {
                        // Fallback to raw data if not JSON
                        if (handlersRef.current[eventName]) {
                            handlersRef.current[eventName](event.data);
                        }
                    }
                });
            });

            // Global error handler
            eventSource.onerror = (err) => {
                console.error("[useRealtime] EventSource error", err);
                setIsConnected(false);
                setError(err);
            };

        } catch (err) {
            console.error("[useRealtime] Failed to initialize EventSource", err);
            setTimeout(() => {
                setError(err);
            }, 0);
        }

        // Cleanup connection on unmount or URL/handlers change
        return () => {
            if (eventSource) {
                console.log(`[useRealtime] Closing SSE connection: ${url}`);
                eventSource.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, enabled, eventNamesKey]); 

    return { isConnected, error };
}
