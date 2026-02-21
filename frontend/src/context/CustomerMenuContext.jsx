import { createContext, useState, useCallback } from "react";
import customerMenuService from "../services/customerMenuService";

const CustomerMenuContext = createContext();

/**
 * CustomerMenuProvider — manages QR session + public menu state
 *
 * Responsibilities:
 *  - QR token validation and table session storage
 *  - Menu items fetching with filters / pagination
 *  - Categories from the menu response
 */
export function CustomerMenuProvider({ children }) {
    // ==================== Session State ====================
    const [token, setToken] = useState(null);
    const [tableInfo, setTableInfo] = useState(null);
    const [sessionValid, setSessionValid] = useState(false);

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
    };

    return (
        <CustomerMenuContext.Provider value={value}>
            {children}
        </CustomerMenuContext.Provider>
    );
}

export default CustomerMenuContext;
