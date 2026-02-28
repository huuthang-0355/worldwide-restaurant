import axios from "axios";
import apiClient from "./apiClient";
import { API_BASE_URL, PAYMENT_ENDPOINTS } from "../constants/api";

/**
 * Public client for payment endpoints that don't require auth.
 */
const publicClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

/**
 * Payment Service — Momo payment operations
 */
const paymentService = {
    /**
     * Initiate a Momo payment for a session
     * @param {string} sessionId
     * @param {string} [returnUrl] - URL to redirect after payment
     * @returns {Promise} MomoPaymentResponse
     */
    initiateMomo: async (sessionId, returnUrl) => {
        const body = { sessionId };
        if (returnUrl) body.returnUrl = returnUrl;
        const response = await publicClient.post(
            PAYMENT_ENDPOINTS.MOMO_INITIATE,
            body,
        );
        return response.data;
    },

    /**
     * Check the status of a Momo payment
     * @param {string} paymentId
     * @returns {Promise} PaymentStatusResponse
     */
    checkStatus: async (paymentId) => {
        const response = await publicClient.get(
            PAYMENT_ENDPOINTS.MOMO_STATUS(paymentId),
        );
        return response.data;
    },

    /**
     * Verify a Momo payment (ADMIN only)
     * @param {string} paymentId
     * @returns {Promise} PaymentStatusResponse
     */
    verify: async (paymentId) => {
        const response = await apiClient.post(
            PAYMENT_ENDPOINTS.MOMO_VERIFY(paymentId),
        );
        return response.data;
    },
};

export default paymentService;
