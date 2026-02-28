import apiClient from "./apiClient";
import { REPORT_ENDPOINTS } from "../constants/api";

/**
 * Report Service — analytics and reporting endpoints
 */
const reportService = {
    /**
     * Get revenue report with optional period/date filters
     * @param {Object} params - { period, startDate, endDate, granularity }
     * @returns {Promise} RevenueReportResponse
     */
    getRevenueReport: async (params = {}) => {
        const response = await apiClient.get(REPORT_ENDPOINTS.REVENUE, {
            params,
        });
        return response.data;
    },

    /**
     * Get top selling items report
     * @param {Object} params - { period, startDate, endDate, limit }
     * @returns {Promise} TopItemsReportResponse
     */
    getTopItemsReport: async (params = {}) => {
        const response = await apiClient.get(REPORT_ENDPOINTS.TOP_ITEMS, {
            params,
        });
        return response.data;
    },

    /**
     * Get chart data for visualizations
     * @param {Object} params - { period, startDate, endDate }
     * @returns {Promise} ChartDataReportResponse
     */
    getChartDataReport: async (params = {}) => {
        const response = await apiClient.get(REPORT_ENDPOINTS.CHART_DATA, {
            params,
        });
        return response.data;
    },
};

export default reportService;
