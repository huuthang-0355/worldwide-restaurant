import axios from "axios";
import { API_BASE_URL, CUSTOMER_ENDPOINTS } from "../constants/api";

/**
 * Public axios instance for customer-facing endpoints.
 * These endpoints use a QR token as a query param (not Bearer auth),
 * so we intentionally avoid the auth interceptor from apiClient.
 */
const publicClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});

/**
 * Customer Menu Service — public endpoints for QR-based menu access
 */
const customerMenuService = {
    /**
     * Validate a QR token and get table session info
     * @param {string} token - JWT token from QR code URL
     * @returns {Promise} { valid, message, tableId, tableNumber, capacity, location }
     */
    verifyQrToken: async (token) => {
        const response = await publicClient.get(
            CUSTOMER_ENDPOINTS.MENU_VERIFY,
            {
                params: { token },
            },
        );
        return response.data;
    },

    /**
     * Fetch menu items with search, filter, sort, and pagination
     * @param {string} token - Valid QR token
     * @param {Object} params - { query, categoryId, sort, chefRecommended, page, limit }
     * @returns {Promise} { categories, items, page, totalItems, totalPages, ... }
     */
    getMenuItems: async (token, params = {}) => {
        const response = await publicClient.get(CUSTOMER_ENDPOINTS.MENU_ITEMS, {
            params: { token, ...params },
        });
        return response.data;
    },
};

export default customerMenuService;
