import apiClient from "./apiClient";
import { KITCHEN_ENDPOINTS } from "../constants/api";

/**
 * Kitchen Service — KDS endpoints (requires KITCHEN_STAFF role)
 */
const kitchenService = {
    /**
     * Get kitchen orders, optionally filtered by status
     * @param {string} [status] - IN_KITCHEN, PREPARING, READY
     * @returns {Promise} KdsOrderListResponse
     */
    getOrders: async (status) => {
        const params = {};
        if (status) params.status = status;
        const response = await apiClient.get(KITCHEN_ENDPOINTS.ORDERS, {
            params,
        });
        return response.data;
    },

    /**
     * Get a single order's details
     * @param {string} orderId
     * @returns {Promise} KdsOrderResponse
     */
    getOrderById: async (orderId) => {
        const response = await apiClient.get(
            KITCHEN_ENDPOINTS.ORDER_BY_ID(orderId),
        );
        return response.data;
    },

    /**
     * Update the status of a kitchen order
     * @param {string} orderId
     * @param {string} status - PREPARING, READY, SERVED, COMPLETED
     * @param {string} [notes]
     * @returns {Promise} OrderResponse
     */
    updateOrderStatus: async (orderId, status, notes) => {
        const body = { status };
        if (notes) body.notes = notes;
        const response = await apiClient.patch(
            KITCHEN_ENDPOINTS.UPDATE_STATUS(orderId),
            body,
        );
        return response.data;
    },

    /**
     * Get real-time kitchen statistics
     * @returns {Promise} KdsStatsResponse
     */
    getStats: async () => {
        const response = await apiClient.get(KITCHEN_ENDPOINTS.STATS);
        return response.data;
    },
};

export default kitchenService;
