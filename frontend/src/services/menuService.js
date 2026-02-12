import apiClient from "./apiClient";
import { ADMIN_ENDPOINTS } from "../constants/api";

/**
 * Menu Service - Handles all menu-related API calls
 */
const menuService = {
    // ==================== Categories ====================

    /**
     * Get all categories
     * @returns {Promise} List of categories
     */
    getAllCategories: async () => {
        const response = await apiClient.get(ADMIN_ENDPOINTS.CATEGORIES);
        return response.data;
    },

    /**
     * Get category by ID
     * @param {string} id - Category UUID
     * @returns {Promise} Category object with menu items
     */
    getCategoryById: async (id) => {
        const response = await apiClient.get(
            ADMIN_ENDPOINTS.CATEGORY_BY_ID(id),
        );
        return response.data;
    },

    /**
     * Create new category
     * @param {Object} categoryData - Category details
     * @returns {Promise} Created category object
     */
    createCategory: async (categoryData) => {
        const response = await apiClient.post(
            ADMIN_ENDPOINTS.CATEGORIES,
            categoryData,
        );
        return response.data;
    },

    /**
     * Update existing category
     * @param {string} id - Category UUID
     * @param {Object} categoryData - Updated category details
     * @returns {Promise} Updated category object
     */
    updateCategory: async (id, categoryData) => {
        const response = await apiClient.patch(
            ADMIN_ENDPOINTS.CATEGORY_BY_ID(id),
            categoryData,
        );
        return response.data;
    },

    /**
     * Update category status
     * @param {string} id - Category UUID
     * @param {string} status - New status (ACTIVE/INACTIVE)
     * @returns {Promise} Updated category object
     */
    updateCategoryStatus: async (id, status) => {
        const response = await apiClient.patch(
            ADMIN_ENDPOINTS.CATEGORY_STATUS(id),
            { status },
        );
        return response.data;
    },

    // ==================== Menu Items ====================

    /**
     * Get all menu items
     * @returns {Promise} List of menu items
     */
    getAllMenuItems: async () => {
        const response = await apiClient.get(ADMIN_ENDPOINTS.MENU_ITEMS);
        return response.data;
    },

    /**
     * Get menu item by ID
     * @param {string} id - Menu item UUID
     * @returns {Promise} Menu item object
     */
    getMenuItemById: async (id) => {
        const response = await apiClient.get(
            ADMIN_ENDPOINTS.MENU_ITEM_BY_ID(id),
        );
        return response.data;
    },

    /**
     * Create new menu item
     * @param {Object} menuItemData - Menu item details
     * @returns {Promise} Created menu item object
     */
    createMenuItem: async (menuItemData) => {
        const response = await apiClient.post(
            ADMIN_ENDPOINTS.MENU_ITEMS,
            menuItemData,
        );
        return response.data;
    },

    /**
     * Update existing menu item
     * @param {string} id - Menu item UUID
     * @param {Object} menuItemData - Updated menu item details
     * @returns {Promise} Updated menu item object
     */
    updateMenuItem: async (id, menuItemData) => {
        const response = await apiClient.patch(
            ADMIN_ENDPOINTS.MENU_ITEM_BY_ID(id),
            menuItemData,
        );
        return response.data;
    },

    /**
     * Delete menu item
     * @param {string} id - Menu item UUID
     * @returns {Promise} void
     */
    deleteMenuItem: async (id) => {
        const response = await apiClient.delete(
            ADMIN_ENDPOINTS.MENU_ITEM_BY_ID(id),
        );
        return response.data;
    },

    // ==================== Menu Item Photos ====================

    /**
     * Upload photo for menu item
     * @param {string} menuItemId - Menu item UUID
     * @param {File} photoFile - Image file to upload
     * @returns {Promise} Created photo object with URL
     */
    uploadPhoto: async (menuItemId, photoFile) => {
        const formData = new FormData();
        formData.append("photo", photoFile);

        const response = await apiClient.post(
            ADMIN_ENDPOINTS.UPLOAD_PHOTO(menuItemId),
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response.data;
    },

    /**
     * Set a photo as primary for menu item
     * @param {string} menuItemId - Menu item UUID
     * @param {string} photoId - Photo UUID
     * @returns {Promise} Success message
     */
    setPrimaryPhoto: async (menuItemId, photoId) => {
        const response = await apiClient.patch(
            ADMIN_ENDPOINTS.SET_PRIMARY_PHOTO(menuItemId, photoId),
        );
        return response.data;
    },

    /**
     * Delete a photo from menu item
     * @param {string} menuItemId - Menu item UUID
     * @param {string} photoId - Photo UUID
     * @returns {Promise} void
     */
    deletePhoto: async (menuItemId, photoId) => {
        const response = await apiClient.delete(
            ADMIN_ENDPOINTS.DELETE_PHOTO(menuItemId, photoId),
        );
        return response.data;
    },

    // ==================== Menu Item Modifier Groups ====================

    /**
     * Assign modifier groups to menu item
     * @param {string} menuItemId - Menu item UUID
     * @param {Array<string>} modifierGroupIds - Array of modifier group UUIDs
     * @returns {Promise} Updated menu item with modifierGroups
     */
    assignModifierGroups: async (menuItemId, modifierGroupIds) => {
        const response = await apiClient.post(
            ADMIN_ENDPOINTS.MENU_ITEM_MODIFIER_GROUPS(menuItemId),
            { modifierGroupIds },
        );
        return response.data;
    },
};

export default menuService;
