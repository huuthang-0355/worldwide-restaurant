import apiClient from "./apiClient";
import { ADMIN_ENDPOINTS } from "../constants/api";

/**
 * Modifier Service - Handles all modifier-related API calls
 */
const modifierService = {
    // ==================== Modifier Groups ====================

    /**
     * Get all modifier groups
     * @returns {Promise} List of modifier groups
     */
    getAllModifierGroups: async () => {
        const response = await apiClient.get(ADMIN_ENDPOINTS.MODIFIER_GROUPS);
        return response.data;
    },

    /**
     * Get modifier group by ID
     * @param {string} id - Modifier group UUID
     * @returns {Promise} Modifier group object
     */
    getModifierGroupById: async (id) => {
        const response = await apiClient.get(
            ADMIN_ENDPOINTS.MODIFIER_GROUP_BY_ID(id),
        );
        return response.data;
    },

    /**
     * Create new modifier group
     * @param {Object} data - Modifier group data (name, selectionType, isRequired, etc.)
     * @returns {Promise} Created modifier group object
     */
    createModifierGroup: async (data) => {
        const response = await apiClient.post(
            ADMIN_ENDPOINTS.MODIFIER_GROUPS,
            data,
        );
        return response.data;
    },

    /**
     * Update modifier group
     * @param {string} id - Modifier group UUID
     * @param {Object} data - Updated modifier group data
     * @returns {Promise} Updated modifier group object
     */
    updateModifierGroup: async (id, data) => {
        const response = await apiClient.put(
            ADMIN_ENDPOINTS.MODIFIER_GROUP_BY_ID(id),
            data,
        );
        return response.data;
    },

    // ==================== Modifier Options ====================

    /**
     * Create option under a modifier group
     * @param {string} groupId - Modifier group UUID
     * @param {Object} data - Option data (name, priceAdjustment)
     * @returns {Promise} Created modifier option object
     */
    createModifierOption: async (groupId, data) => {
        const response = await apiClient.post(
            ADMIN_ENDPOINTS.MODIFIER_GROUP_OPTIONS(groupId),
            data,
        );
        return response.data;
    },

    /**
     * Update modifier option
     * @param {string} optionId - Option UUID
     * @param {Object} data - Updated option data (name, priceAdjustment)
     * @returns {Promise} Updated modifier option object
     */
    updateModifierOption: async (optionId, data) => {
        const response = await apiClient.put(
            ADMIN_ENDPOINTS.MODIFIER_OPTION_BY_ID(optionId),
            data,
        );
        return response.data;
    },
};

export default modifierService;
