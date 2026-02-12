// Menu Item Status
export const MENU_STATUS = {
    AVAILABLE: "AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    SOLD_OUT: "SOLD_OUT",
};

// Category Status
export const CATEGORY_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};

// Status Display Configuration
export const STATUS_CONFIG = {
    [MENU_STATUS.AVAILABLE]: {
        label: "Available",
        color: "bg-green-500",
    },
    [MENU_STATUS.UNAVAILABLE]: {
        label: "Unavailable",
        color: "bg-gray-500",
    },
    [MENU_STATUS.SOLD_OUT]: {
        label: "Sold Out",
        color: "bg-red-500",
    },
};
