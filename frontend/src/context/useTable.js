import { useContext } from "react";
import TableContext from "./TableContext";

/**
 * useTable - Hook to access table context
 */
export function useTable() {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error("useTable must be used within TableProvider");
    }
    return context;
}
