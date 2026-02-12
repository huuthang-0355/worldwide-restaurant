import { useContext } from "react";
import CategoryContext from "./CategoryContext";

/**
 * useCategory - Hook to access category context
 */
export function useCategory() {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error("useCategory must be used within CategoryProvider");
    }
    return context;
}
