// API Configuration
export const API_BASE_URL = "http://localhost:8080/api";

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
};
