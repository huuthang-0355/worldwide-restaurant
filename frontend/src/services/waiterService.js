import apiClient from "./apiClient";
import { WAITER_ENDPOINTS } from "../constants/api";

/**
 * Waiter Service — waiter operation endpoints (requires WAITER role)
 */
const waiterService = {
    /**
     * Get all orders for waiter review
     * @param {Object} params - { status, sortBy, sortDirection }
     * @returns {Promise} OrderListResponse
     */
    getAllOrders: async (params = {}) => {
        const response = await apiClient.get(WAITER_ENDPOINTS.ALL_ORDERS, {
            params,
        });
        return response.data;
    },

    /**
     * Get pending orders (submitted but not confirmed by staff)
     * @returns {Promise} PendingOrderListResponse
     */
    getPendingOrders: async () => {
        const response = await apiClient.get(WAITER_ENDPOINTS.PENDING_ORDERS);
        return response.data;
    },

    /**
     * Accept a specific item in a pending order
     * @param {string} orderId
     * @param {string} itemId
     * @returns {Promise} OrderResponse
     */
    acceptItem: async (orderId, itemId) => {
        const response = await apiClient.patch(
            WAITER_ENDPOINTS.ACCEPT_ITEM(orderId, itemId),
        );
        return response.data;
    },

    /**
     * Reject a specific item in a pending order
     * @param {string} orderId
     * @param {string} itemId
     * @param {string} reason - Rejection reason (required)
     * @returns {Promise} OrderResponse
     */
    rejectItem: async (orderId, itemId, reason) => {
        const response = await apiClient.patch(
            WAITER_ENDPOINTS.REJECT_ITEM(orderId, itemId),
            { reason },
        );
        return response.data;
    },

    /**
     * Send an order to the kitchen
     * @param {string} orderId
     * @returns {Promise} OrderResponse
     */
    sendToKitchen: async (orderId) => {
        const response = await apiClient.post(
            WAITER_ENDPOINTS.SEND_TO_KITCHEN(orderId),
        );
        return response.data;
    },

    /**
     * Mark an order as served
     * @param {string} orderId
     * @returns {Promise} OrderResponse
     */
    markServed: async (orderId) => {
        const response = await apiClient.post(
            WAITER_ENDPOINTS.MARK_SERVED(orderId),
        );
        return response.data;
    },

    /**
     * Get tables that have requested their bill
     * @returns {Promise} BillRequestListResponse
     */
    getBillRequests: async () => {
        const response = await apiClient.get(WAITER_ENDPOINTS.BILL_REQUESTS);
        return response.data;
    },
};

export default waiterService;
