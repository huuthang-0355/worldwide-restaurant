import { createContext, useState, useCallback, useEffect } from "react";
import customerMenuService from "../services/customerMenuService";

const CustomerMenuContext = createContext();

const TOKEN_KEY = "restaurantQrToken";
const TABLE_INFO_KEY = "restaurantTableInfo";

/**
 * CustomerMenuProvider — manages QR session + public menu state
 *
 * Responsibilities:
 *  - QR token validation and table session storage
 *  - Menu items fetching with filters / pagination
 *  - Categories from the menu response
 *
 * Token and tableInfo are persisted to localStorage to survive page refreshes.
 */
export function CustomerMenuProvider({ children }) {
    // ==================== Session State ====================
    // Initialize from localStorage if available
    const [token, setToken] = useState(
        () => localStorage.getItem(TOKEN_KEY) || null,
    );
    const [tableInfo, setTableInfo] = useState(() => {
        const stored = localStorage.getItem(TABLE_INFO_KEY);
        return stored ? JSON.parse(stored) : null;
    });
    const [sessionValid, setSessionValid] = useState(() => {
        // Session is valid if we have both token and tableInfo
        return !!(
            localStorage.getItem(TOKEN_KEY) &&
            localStorage.getItem(TABLE_INFO_KEY)
        );
    });

    // ==================== Menu Data ====================
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
    });

    // ==================== UI State ====================
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Persist token to localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }, [token]);

    // Persist tableInfo to localStorage
    useEffect(() => {
        if (tableInfo) {
            localStorage.setItem(TABLE_INFO_KEY, JSON.stringify(tableInfo));
        } else {
            localStorage.removeItem(TABLE_INFO_KEY);
        }
    }, [tableInfo]);

    /**
     * Clear the session (for logout or session end)
     */
    const clearSession = useCallback(() => {
        setToken(null);
        setTableInfo(null);
        setSessionValid(false);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TABLE_INFO_KEY);
    }, []);

    /**
     * Validate a QR token and establish a table session.
     * Called once when the customer first lands on /menu?token=xxx
     */
    const verifyToken = useCallback(async (qrToken) => {
        try {
            setLoading(true);
            setError(null);
            const data = await customerMenuService.verifyQrToken(qrToken);

            if (data.valid) {
                setToken(qrToken);
                setTableInfo({
                    tableId: data.tableId,
                    tableNumber: data.tableNumber,
                    capacity: data.capacity,
                    location: data.location,
                });
                setSessionValid(true);
                return data;
            } else {
                setError(data.message || "Invalid QR code");
                setSessionValid(false);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Invalid or expired QR code",
            );
            setSessionValid(false);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch menu items (requires a valid token in state).
     * @param {Object} params - { query, categoryId, sort, chefRecommended, page, limit }
     */
    const fetchMenuItems = useCallback(
        async (params = {}) => {
            if (!token) return;
            try {
                setLoading(true);
                setError(null);
                const data = await customerMenuService.getMenuItems(
                    token,
                    params,
                );
                setCategories(data.categories || []);
                setItems(data.items || []);
                setPagination({
                    page: data.page,
                    limit: data.limit,
                    totalItems: data.totalItems,
                    totalPages: data.totalPages,
                    hasNext: data.hasNext,
                    hasPrevious: data.hasPrevious,
                });
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load menu");
            } finally {
                setLoading(false);
            }
        },
        [token],
    );

    /**
     * Find a single item by ID from the already-loaded items array.
     * Avoids an extra API call when navigating to item detail.
     */
    const getItemById = useCallback(
        (id) => items.find((item) => item.id === id) || null,
        [items],
    );

    const value = {
        // Session
        token,
        tableInfo,
        sessionValid,

        // Data
        categories,
        items,
        pagination,

        // UI
        loading,
        error,

        // Actions
        verifyToken,
        fetchMenuItems,
        getItemById,
        clearSession,
    };

    return (
        <CustomerMenuContext.Provider value={value}>
            {children}
        </CustomerMenuContext.Provider>
    );
}

export default CustomerMenuContext;
