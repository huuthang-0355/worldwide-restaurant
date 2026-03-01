// API Configuration
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

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
    ORDER_HISTORY: "/users/order-history",
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

// Session Management (Public — QR-based sessions, no auth)
export const SESSION_ENDPOINTS = {
    CREATE: "/sessions",
    GET: (id) => `/sessions/${id}`,
    ADD_CART_ITEM: (id) => `/sessions/${id}/cart/items`,
    UPDATE_CART_ITEM: (id, itemId) => `/sessions/${id}/cart/items/${itemId}`,
    REMOVE_CART_ITEM: (id, itemId) => `/sessions/${id}/cart/items/${itemId}`,
    CHECKOUT: (id) => `/sessions/${id}/checkout`,
    GET_ORDERS: (id) => `/sessions/${id}/orders`,
    BILL_PREVIEW: (id) => `/sessions/${id}/bill-preview`,
    REQUEST_BILL: (id) => `/sessions/${id}/request-bill`,
    LINK_USER: (id) => `/sessions/${id}/link-user`,
};

// Kitchen Display System (Role: KITCHEN_STAFF)
export const KITCHEN_ENDPOINTS = {
    ORDERS: "/kitchen/orders",
    ORDER_BY_ID: (id) => `/kitchen/orders/${id}`,
    UPDATE_STATUS: (id) => `/kitchen/orders/${id}/status`,
    STATS: "/kitchen/orders/stats",
};

// Waiter Features (Role: WAITER)
export const WAITER_ENDPOINTS = {
    ALL_ORDERS: "/waiter/orders",
    PENDING_ORDERS: "/waiter/orders/pending",
    ACCEPT_ITEM: (orderId, itemId) =>
        `/waiter/orders/${orderId}/items/${itemId}/accept`,
    REJECT_ITEM: (orderId, itemId) =>
        `/waiter/orders/${orderId}/items/${itemId}/reject`,
    SEND_TO_KITCHEN: (orderId) => `/waiter/orders/${orderId}/send-to-kitchen`,
    MARK_SERVED: (orderId) => `/waiter/orders/${orderId}/served`,
    BILL_REQUESTS: "/waiter/bill-requests",
};

// Momo Payment (Public except verify)
export const PAYMENT_ENDPOINTS = {
    MOMO_INITIATE: "/payments/momo/initiate",
    MOMO_CALLBACK: "/payments/momo/callback",
    MOMO_STATUS: (id) => `/payments/momo/${id}/status`,
    MOMO_VERIFY: (id) => `/payments/momo/${id}/verify`,
};

// Reports (Role: ADMIN, MANAGER)
export const REPORT_ENDPOINTS = {
    REVENUE: "/reports/revenue",
    TOP_ITEMS: "/reports/top-items",
    CHART_DATA: "/reports/chart-data",
};
