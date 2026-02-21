// API Configuration
export const API_BASE_URL = "http://localhost:8080/api";

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY_EMAIL: "/auth/verify-email",
    CHECK_EMAIL: "/auth/check-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    UPDATE_PASSWORD: "/auth/update-password",
};

// User Endpoints
export const USER_ENDPOINTS = {
    PROFILE: "/users/profile",
    AVATAR: "/users/avatar",
    STAFF: "/users/staff",
    STAFF_BY_ID: (id) => `/users/staff/${id}`,
    STAFF_STATUS: (id) => `/users/staff/${id}/status`,
};

// Storage keys for tokens
export const STORAGE_KEYS = {
    STAFF_TOKEN: "staffToken",
    CUSTOMER_TOKEN: "customerToken",
};

// Admin API Endpoints
export const ADMIN_ENDPOINTS = {
    // Categories
    CATEGORIES: "/admin/categories",
    CATEGORY_BY_ID: (id) => `/admin/categories/${id}`,
    CATEGORY_STATUS: (id) => `/admin/categories/${id}/status`,

    // Menu Items
    MENU_ITEMS: "/admin/menu/items",
    MENU_ITEM_BY_ID: (id) => `/admin/menu/items/${id}`,

    // Menu Item Photos
    UPLOAD_PHOTO: (menuItemId) => `/admin/menu/items/${menuItemId}/photo`,
    SET_PRIMARY_PHOTO: (menuItemId, photoId) =>
        `/admin/menu/items/${menuItemId}/photo/${photoId}/primary`,
    DELETE_PHOTO: (menuItemId, photoId) =>
        `/admin/menu/items/${menuItemId}/photo/${photoId}`,

    // Menu Item Modifier Groups
    MENU_ITEM_MODIFIER_GROUPS: (menuItemId) =>
        `/admin/menu/items/${menuItemId}/modifier-groups`,

    // Modifier Groups
    MODIFIER_GROUPS: "/admin/menu/modifier-groups",
    MODIFIER_GROUP_BY_ID: (id) => `/admin/menu/modifier-groups/${id}`,
    MODIFIER_GROUP_OPTIONS: (groupId) =>
        `/admin/menu/modifier-groups/${groupId}/options`,

    // Modifier Options
    MODIFIER_OPTION_BY_ID: (id) => `/admin/menu/modifier-options/${id}`,

    // Tables
    TABLES: "/admin/tables",
    TABLE_BY_ID: (id) => `/admin/tables/${id}`,
    TABLE_STATUS: (id) => `/admin/tables/${id}/status`,
    TABLE_QR_GENERATE: (id) => `/admin/tables/${id}/qr/generate`,
    TABLE_QR_REGENERATE: (id) => `/admin/tables/${id}/qr/regenerate`,
    TABLE_QR_DOWNLOAD: (id) => `/admin/tables/${id}/qr/download`,
    TABLES_QR_DOWNLOAD_ALL: "/admin/tables/qr/download-all",
};

// Customer / Public Endpoints (no auth required — use QR token as query param)
export const CUSTOMER_ENDPOINTS = {
    MENU_VERIFY: "/menu",
    MENU_ITEMS: "/menu/items",
};
