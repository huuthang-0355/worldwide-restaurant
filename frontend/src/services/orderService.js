import axios from "axios";
import {
    API_BASE_URL,
    SESSION_ENDPOINTS,
    STORAGE_KEYS,
} from "../constants/api";

/**
 * Public axios instance for session-based endpoints.
 * Session endpoints are public (no Bearer auth) — the session ID
 * itself acts as the authentication mechanism.
 */
const publicClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});

/**
 * Order Service — session management, cart operations, checkout, orders, bill
 */
const orderService = {
    // ==================== Session ====================

    /**
     * Start a new dining session from a QR token
     * @param {string} token - QR code UUID token
     * @param {number} guestCount - Number of guests (min: 1)
     * @returns {Promise} SessionResponse
     */
    startSession: async (token, guestCount) => {
        const response = await publicClient.post(SESSION_ENDPOINTS.CREATE, {
            token,
            guestCount,
        });
        return response.data;
    },

    /**
     * Get current session details including cart items
     * @param {string} sessionId
     * @returns {Promise} SessionResponse
     */
    getSession: async (sessionId) => {
        const response = await publicClient.get(
            SESSION_ENDPOINTS.GET(sessionId),
        );
        return response.data;
    },

    // ==================== Cart ====================

    /**
     * Add a menu item to the session cart
     * @param {string} sessionId
     * @param {Object} data - { menuItemId, quantity, modifierOptionIds?, specialInstructions? }
     * @returns {Promise} Updated SessionResponse
     */
    addToCart: async (sessionId, data) => {
        const response = await publicClient.post(
            SESSION_ENDPOINTS.ADD_CART_ITEM(sessionId),
            data,
        );
        return response.data;
    },

    /**
     * Update a cart item (quantity, modifiers, instructions)
     * @param {string} sessionId
     * @param {string} itemId - Cart item ID
     * @param {Object} data - { quantity?, modifierOptionIds?, specialInstructions? }
     * @returns {Promise} Updated SessionResponse
     */
    updateCartItem: async (sessionId, itemId, data) => {
        const response = await publicClient.put(
            SESSION_ENDPOINTS.UPDATE_CART_ITEM(sessionId, itemId),
            data,
        );
        return response.data;
    },

    /**
     * Remove an item from the cart
     * @param {string} sessionId
     * @param {string} itemId - Cart item ID
     * @returns {Promise} MessageResponse
     */
    removeCartItem: async (sessionId, itemId) => {
        const response = await publicClient.delete(
            SESSION_ENDPOINTS.REMOVE_CART_ITEM(sessionId, itemId),
        );
        return response.data;
    },

    // ==================== Orders ====================

    /**
     * Checkout — convert cart items into a submitted order
     * @param {string} sessionId
     * @param {string} [specialInstructions] - Order-level instructions
     * @returns {Promise} OrderResponse
     */
    checkout: async (sessionId, specialInstructions) => {
        const body = {};
        if (specialInstructions) body.specialInstructions = specialInstructions;
        const response = await publicClient.post(
            SESSION_ENDPOINTS.CHECKOUT(sessionId),
            body,
        );
        return response.data;
    },

    /**
     * Get all orders for the current session
     * @param {string} sessionId
     * @returns {Promise} OrderListResponse
     */
    getOrders: async (sessionId) => {
        const response = await publicClient.get(
            SESSION_ENDPOINTS.GET_ORDERS(sessionId),
        );
        return response.data;
    },

    // ==================== Bill ====================

    /**
     * Preview the bill (subtotal, tax, service charge, total)
     * @param {string} sessionId
     * @returns {Promise} BillPreviewResponse
     */
    getBillPreview: async (sessionId) => {
        const response = await publicClient.get(
            SESSION_ENDPOINTS.BILL_PREVIEW(sessionId),
        );
        return response.data;
    },

    /**
     * Request the bill (signals waiter / enables payment)
     * @param {string} sessionId
     * @returns {Promise} MessageResponse
     */
    requestBill: async (sessionId) => {
        const response = await publicClient.post(
            SESSION_ENDPOINTS.REQUEST_BILL(sessionId),
        );
        return response.data;
    },

    // ==================== User Linking ====================

    /**
     * Link the logged-in customer to an existing session
     * This allows tracking order history for the customer
     * @param {string} sessionId
     * @returns {Promise} SessionResponse
     */
    linkUserToSession: async (sessionId) => {
        const token = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
        if (!token) {
            throw new Error("No customer token found");
        }

        const response = await axios.post(
            `${API_BASE_URL}${SESSION_ENDPOINTS.LINK_USER(sessionId)}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
        return response.data;
    },
};

export default orderService;
