import apiClient from "./apiClient";
import { ADMIN_ENDPOINTS } from "../constants/api";

/**
 * Table Service - Handles all table & QR management API calls
 */
const tableService = {
    // ==================== Table CRUD ====================

    /**
     * Get all tables with optional filters
     * @param {Object} params - { status, location, sortBy }
     * @returns {Promise} { tables, totalCount }
     */
    getAllTables: async (params = {}) => {
        const response = await apiClient.get(ADMIN_ENDPOINTS.TABLES, {
            params,
        });
        return response.data;
    },

    /**
     * Get a single table by ID
     * @param {string} id - Table UUID
     * @returns {Promise} Table object
     */
    getTableById: async (id) => {
        const response = await apiClient.get(ADMIN_ENDPOINTS.TABLE_BY_ID(id));
        return response.data;
    },

    /**
     * Create a new table
     * @param {Object} data - { tableNumber, capacity, location, description }
     * @returns {Promise} Created table response
     */
    createTable: async (data) => {
        const response = await apiClient.post(ADMIN_ENDPOINTS.TABLES, data);
        return response.data;
    },

    /**
     * Update an existing table
     * @param {string} id - Table UUID
     * @param {Object} data - { tableNumber, capacity, location, description }
     * @returns {Promise} Updated table response
     */
    updateTable: async (id, data) => {
        const response = await apiClient.put(
            ADMIN_ENDPOINTS.TABLE_BY_ID(id),
            data,
        );
        return response.data;
    },

    /**
     * Update table status (ACTIVE / INACTIVE)
     * @param {string} id - Table UUID
     * @param {string} status - "ACTIVE" or "INACTIVE"
     * @returns {Promise} Status update response
     */
    updateTableStatus: async (id, status) => {
        const response = await apiClient.patch(
            ADMIN_ENDPOINTS.TABLE_STATUS(id),
            { status },
        );
        return response.data;
    },

    /**
     * Delete a table (soft-delete)
     * @param {string} id - Table UUID
     * @returns {Promise} void
     */
    deleteTable: async (id) => {
        await apiClient.delete(ADMIN_ENDPOINTS.TABLE_BY_ID(id));
    },

    // ==================== QR Code Management ====================

    /**
     * Generate QR code for a table
     * @param {string} id - Table UUID
     * @returns {Promise} { tableId, tableNumber, qrUrl, generatedAt }
     */
    generateQr: async (id) => {
        const response = await apiClient.post(
            ADMIN_ENDPOINTS.TABLE_QR_GENERATE(id),
        );
        return response.data;
    },

    /**
     * Regenerate QR code (invalidates old token)
     * @param {string} id - Table UUID
     * @returns {Promise} { tableId, tableNumber, qrUrl, generatedAt }
     */
    regenerateQr: async (id) => {
        const response = await apiClient.post(
            ADMIN_ENDPOINTS.TABLE_QR_REGENERATE(id),
        );
        return response.data;
    },

    /**
     * Download QR code for a single table
     * @param {string} id - Table UUID
     * @param {string} format - "png" or "pdf"
     * @returns {Promise} Blob data
     */
    downloadQr: async (id, format = "png") => {
        const response = await apiClient.get(
            ADMIN_ENDPOINTS.TABLE_QR_DOWNLOAD(id),
            {
                params: { format },
                responseType: "blob",
            },
        );
        return response.data;
    },

    /**
     * Download all QR codes as a single PDF
     * @returns {Promise} Blob data (PDF)
     */
    downloadAllQr: async () => {
        const response = await apiClient.get(
            ADMIN_ENDPOINTS.TABLES_QR_DOWNLOAD_ALL,
            { responseType: "blob" },
        );
        return response.data;
    },
};

export default tableService;
