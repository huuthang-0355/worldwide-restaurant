import { createContext, useState, useCallback } from "react";
import tableService from "../services/tableService";

const TableContext = createContext();

/**
 * TableProvider - Provides table state and CRUD + QR actions
 */
export function TableProvider({ children }) {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all tables with optional filters
     * @param {Object} params - { status, location, sortBy }
     */
    const fetchTables = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const data = await tableService.getAllTables(params);
            setTables(data.tables || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load tables");
            console.error("Error fetching tables:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new table and refresh the list
     */
    const createTable = useCallback(
        async (formData) => {
            await tableService.createTable(formData);
            await fetchTables();
        },
        [fetchTables],
    );

    /**
     * Update an existing table and refresh list
     */
    const updateTable = useCallback(
        async (id, formData) => {
            await tableService.updateTable(id, formData);
            await fetchTables();
        },
        [fetchTables],
    );

    /**
     * Toggle table status (ACTIVE / INACTIVE)
     */
    const updateTableStatus = useCallback(async (id, status) => {
        await tableService.updateTableStatus(id, status);
        setTables((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status } : t)),
        );
    }, []);

    /**
     * Delete a table and remove from local state
     */
    const deleteTable = useCallback(async (id) => {
        await tableService.deleteTable(id);
        setTables((prev) => prev.filter((t) => t.id !== id));
    }, []);

    /**
     * Generate QR code for a table
     */
    const generateQr = useCallback(async (id) => {
        const result = await tableService.generateQr(id);
        // Update hasQrCode flag locally
        setTables((prev) =>
            prev.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          hasQrCode: true,
                          qrTokenCreatedAt: result.generatedAt,
                      }
                    : t,
            ),
        );
        return result;
    }, []);

    /**
     * Regenerate QR code for a table
     */
    const regenerateQr = useCallback(async (id) => {
        const result = await tableService.regenerateQr(id);
        setTables((prev) =>
            prev.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          hasQrCode: true,
                          qrTokenCreatedAt: result.generatedAt,
                      }
                    : t,
            ),
        );
        return result;
    }, []);

    const value = {
        tables,
        loading,
        error,
        fetchTables,
        createTable,
        updateTable,
        updateTableStatus,
        deleteTable,
        generateQr,
        regenerateQr,
    };

    return (
        <TableContext.Provider value={value}>{children}</TableContext.Provider>
    );
}

export default TableContext;
