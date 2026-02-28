import apiClient from "./apiClient";
import { AUTH_ENDPOINTS, USER_ENDPOINTS, STORAGE_KEYS } from "../constants/api";

/**
 * Auth Service - Handles authentication and user management API calls
 */
const authService = {
    // ==================== Authentication ====================

    /**
     * Login user
     * @param {Object} credentials - { email, password }
     * @param {string} userType - "staff" or "customer"
     * @returns {Promise} Auth response with token
     */
    login: async (credentials, userType = "staff") => {
        const response = await apiClient.post(
            AUTH_ENDPOINTS.LOGIN,
            credentials,
        );
        const { token, user } = response.data;

        // Store token based on user type
        const tokenKey =
            userType === "staff"
                ? STORAGE_KEYS.STAFF_TOKEN
                : STORAGE_KEYS.CUSTOMER_TOKEN;
        localStorage.setItem(tokenKey, token);

        return { token, user };
    },

    /**
     * Register new user
     * @param {Object} data - Registration data
     * @returns {Promise} Message response
     */
    register: async (data) => {
        const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, data);
        return response.data;
    },

    /**
     * Verify email with token
     * @param {string} verificationToken
     * @returns {Promise} Message response
     */
    verifyEmail: async (verificationToken) => {
        const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, {
            token: verificationToken,
        });
        return response.data;
    },

    /**
     * Check if email is available
     * @param {string} email
     * @returns {Promise} { available: boolean }
     */
    checkEmail: async (email) => {
        const response = await apiClient.get(AUTH_ENDPOINTS.CHECK_EMAIL, {
            params: { email },
        });
        return response.data;
    },

    /**
     * Request password reset
     * @param {string} email
     * @returns {Promise} Message response
     */
    forgotPassword: async (email) => {
        const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
            email,
        });
        return response.data;
    },

    /**
     * Reset password with token
     * @param {Object} data - { token, newPassword, confirmPassword }
     * @returns {Promise} Message response
     */
    resetPassword: async (data) => {
        const response = await apiClient.post(
            AUTH_ENDPOINTS.RESET_PASSWORD,
            data,
        );
        return response.data;
    },

    /**
     * Update current user's password
     * @param {Object} data - { currentPassword, newPassword, confirmPassword }
     * @returns {Promise} Message response
     */
    updatePassword: async (data) => {
        const response = await apiClient.put(
            AUTH_ENDPOINTS.UPDATE_PASSWORD,
            data,
        );
        return response.data;
    },

    /**
     * Logout user
     * @param {string} userType - "staff" or "customer"
     */
    logout: (userType = "staff") => {
        const tokenKey =
            userType === "staff"
                ? STORAGE_KEYS.STAFF_TOKEN
                : STORAGE_KEYS.CUSTOMER_TOKEN;
        localStorage.removeItem(tokenKey);
    },

    /**
     * Get stored token
     * @param {string} userType - "staff" or "customer"
     * @returns {string|null} Token or null
     */
    getToken: (userType = "staff") => {
        const tokenKey =
            userType === "staff"
                ? STORAGE_KEYS.STAFF_TOKEN
                : STORAGE_KEYS.CUSTOMER_TOKEN;
        return localStorage.getItem(tokenKey);
    },

    /**
     * Check if user is authenticated
     * @param {string} userType - "staff" or "customer"
     * @returns {boolean}
     */
    isAuthenticated: (userType = "staff") => {
        return !!authService.getToken(userType);
    },

    // ==================== User Profile ====================

    /**
     * Get current user profile
     * @returns {Promise} User profile
     */
    getProfile: async () => {
        const response = await apiClient.get(USER_ENDPOINTS.PROFILE);
        return response.data;
    },

    /**
     * Update current user profile
     * @param {Object} data - Profile data
     * @returns {Promise} Updated profile
     */
    updateProfile: async (data) => {
        const response = await apiClient.put(USER_ENDPOINTS.PROFILE, data);
        return response.data;
    },

    /**
     * Upload user avatar
     * @param {File} file - Avatar file
     * @returns {Promise} Updated profile with avatar
     */
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append("photo", file);
        const response = await apiClient.post(USER_ENDPOINTS.AVATAR, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /**
     * Get customer order history (requires CUSTOMER role)
     * @returns {Promise} Order history with sessions and orders
     */
    getOrderHistory: async () => {
        const response = await apiClient.get(USER_ENDPOINTS.ORDER_HISTORY);
        return response.data;
    },

    // ==================== Staff Management (Admin Only) ====================

    /**
     * Get all staff members
     * @returns {Promise} List of staff
     */
    getAllStaff: async () => {
        const response = await apiClient.get(USER_ENDPOINTS.STAFF);
        return response.data;
    },

    /**
     * Get staff member by ID
     * @param {string} id - Staff UUID
     * @returns {Promise} Staff member
     */
    getStaffById: async (id) => {
        const response = await apiClient.get(USER_ENDPOINTS.STAFF_BY_ID(id));
        return response.data;
    },

    /**
     * Create new staff member
     * @param {Object} data - { email, password, firstName, lastName, role }
     * @returns {Promise} Created staff member
     */
    createStaff: async (data) => {
        const response = await apiClient.post(USER_ENDPOINTS.STAFF, data);
        return response.data;
    },

    /**
     * Update staff member
     * @param {string} id - Staff UUID
     * @param {Object} data - Updated staff data
     * @returns {Promise} Updated staff member
     */
    updateStaff: async (id, data) => {
        const response = await apiClient.put(
            USER_ENDPOINTS.STAFF_BY_ID(id),
            data,
        );
        return response.data;
    },

    /**
     * Update staff status
     * @param {string} id - Staff UUID
     * @param {string} status - New status (ACTIVE, INACTIVE)
     * @returns {Promise} Updated staff member
     */
    updateStaffStatus: async (id, status) => {
        const response = await apiClient.put(USER_ENDPOINTS.STAFF_STATUS(id), {
            status,
        });
        return response.data;
    },
};

export default authService;
