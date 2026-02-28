import { createContext, useState, useCallback, useEffect } from "react";
import orderService from "../services/orderService";

const SessionContext = createContext();

const SESSION_ID_KEY = "restaurantSessionId";

/**
 * SessionProvider — manages the dining session lifecycle:
 *  - Session creation and retrieval
 *  - Cart state (add / update / remove items)
 *  - Checkout and order tracking
 *  - Bill preview and bill request
 *
 * Works alongside CustomerMenuProvider. The menu context handles
 * QR verification and menu browsing; this context handles the
 * transactional session (cart → order → bill).
 *
 * SessionId is persisted in localStorage to survive page refreshes.
 */
export function SessionProvider({ children }) {
    // ==================== Session State ====================
    const [sessionId, setSessionId] = useState(() => {
        // Initialize from localStorage if available
        return localStorage.getItem(SESSION_ID_KEY) || null;
    });
    const [session, setSession] = useState(null); // full SessionResponse
    const [orders, setOrders] = useState([]);
    const [billPreview, setBillPreview] = useState(null);

    // ==================== UI State ====================
    const [loading, setLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [error, setError] = useState(null);

    // Persist sessionId to localStorage whenever it changes
    useEffect(() => {
        if (sessionId) {
            localStorage.setItem(SESSION_ID_KEY, sessionId);
        } else {
            localStorage.removeItem(SESSION_ID_KEY);
        }
    }, [sessionId]);

    // ==================== Derived State ====================
    const cartItems = session?.cartItems || [];
    const cartTotal = session?.cartTotal || 0;
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // ==================== Session Actions ====================

    /**
     * Start a new dining session using a QR token
     */
    const startSession = useCallback(async (token, guestCount = 1) => {
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.startSession(token, guestCount);
            setSessionId(data.sessionId);
            setSession(data);
            return data;
        } catch (err) {
            const msg =
                err.response?.data?.message || "Failed to start session";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Refresh the session data (cart items, status, etc.)
     */
    const refreshSession = useCallback(async () => {
        if (!sessionId) {
            console.warn("Cannot refresh session: No sessionId");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getSession(sessionId);
            setSession(data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to refresh session",
            );
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    // Auto-load session data on mount if sessionId exists
    useEffect(() => {
        if (sessionId && !session) {
            refreshSession();
        }
    }, [sessionId, session, refreshSession]);

    // ==================== Cart Actions ====================

    /**
     * Add an item to the cart
     * @param {Object} data - { menuItemId, quantity, modifierOptionIds?, specialInstructions? }
     */
    const addToCart = useCallback(
        async (data) => {
            if (!sessionId) {
                console.error("Cannot add to cart: No session ID");
                throw new Error(
                    "No active session. Please scan QR code again.",
                );
            }
            try {
                setCartLoading(true);
                setError(null);
                const updated = await orderService.addToCart(sessionId, data);
                setSession(updated);
                return updated;
            } catch (err) {
                console.error("SessionContext addToCart error:", err);
                const msg =
                    err.response?.data?.message || "Failed to add item to cart";
                setError(msg);
                throw err;
            } finally {
                setCartLoading(false);
            }
        },
        [sessionId],
    );

    /**
     * Update a cart item
     * @param {string} itemId - Cart item ID
     * @param {Object} data - { quantity?, modifierOptionIds?, specialInstructions? }
     */
    const updateCartItem = useCallback(
        async (itemId, data) => {
            if (!sessionId) {
                console.error("No sessionId available!");
                throw new Error("No active session");
            }
            if (!itemId) {
                console.error("No itemId provided!");
                throw new Error("Item ID is required");
            }
            try {
                setCartLoading(true);
                setError(null);
                const updated = await orderService.updateCartItem(
                    sessionId,
                    itemId,
                    data,
                );
                setSession(updated);
                return updated;
            } catch (err) {
                console.error("Update cart item error:", err);
                const msg =
                    err.response?.data?.message || "Failed to update cart item";
                setError(msg);
                throw err;
            } finally {
                setCartLoading(false);
            }
        },
        [sessionId],
    );

    /**
     * Remove an item from the cart
     * @param {string} itemId - Cart item ID
     */
    const removeCartItem = useCallback(
        async (itemId) => {
            if (!sessionId) return;
            try {
                setCartLoading(true);
                setError(null);
                await orderService.removeCartItem(sessionId, itemId);
                // Refresh session to get updated cart
                const data = await orderService.getSession(sessionId);
                setSession(data);
            } catch (err) {
                const msg =
                    err.response?.data?.message || "Failed to remove cart item";
                setError(msg);
                throw err;
            } finally {
                setCartLoading(false);
            }
        },
        [sessionId],
    );

    // ==================== Order Actions ====================

    /**
     * Checkout — convert cart to an order
     * @param {string} [specialInstructions]
     */
    const checkout = useCallback(
        async (specialInstructions) => {
            if (!sessionId) return;
            try {
                setLoading(true);
                setError(null);
                const order = await orderService.checkout(
                    sessionId,
                    specialInstructions,
                );
                // Refresh session (cart is now empty) and orders list
                const [sessionData, ordersData] = await Promise.all([
                    orderService.getSession(sessionId),
                    orderService.getOrders(sessionId),
                ]);
                setSession(sessionData);
                setOrders(ordersData.orders || []);
                return order;
            } catch (err) {
                const msg =
                    err.response?.data?.message || "Failed to place order";
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [sessionId],
    );

    /**
     * Fetch all orders for the current session
     */
    const fetchOrders = useCallback(async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getOrders(sessionId);
            setOrders(data.orders || []);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    // ==================== Bill Actions ====================

    /**
     * Get bill preview (subtotal, tax, service charge, total)
     */
    const fetchBillPreview = useCallback(async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getBillPreview(sessionId);
            setBillPreview(data);
            return data;
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load bill preview",
            );
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    /**
     * Request the bill (signals waiter / enables payment)
     */
    const requestBill = useCallback(async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.requestBill(sessionId);
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to request bill";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => setError(null), []);

    const value = {
        // Session
        sessionId,
        session,
        setSessionId,
        startSession,
        refreshSession,

        // Cart
        cartItems,
        cartTotal,
        cartCount,
        cartLoading,
        addToCart,
        updateCartItem,
        removeCartItem,

        // Orders
        orders,
        checkout,
        fetchOrders,

        // Bill
        billPreview,
        fetchBillPreview,
        requestBill,

        // UI
        loading,
        error,
        clearError,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export default SessionContext;
