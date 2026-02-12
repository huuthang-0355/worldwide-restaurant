import { createContext, useState, useCallback } from "react";
import menuService from "../services/menuService";

const CategoryContext = createContext();

/**
 * CategoryProvider - Provides category state and actions
 */
export function CategoryProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await menuService.getAllCategories();
            setCategories(data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load categories",
            );
            console.error("Error fetching categories:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (formData) => {
        const newCategory = await menuService.createCategory(formData);
        setCategories((prev) => [...prev, newCategory]);
        return newCategory;
    }, []);

    const updateCategory = useCallback(async (id, formData) => {
        const updated = await menuService.updateCategory(id, formData);
        setCategories((prev) =>
            prev.map((cat) => (cat.id === updated.id ? updated : cat)),
        );
        return updated;
    }, []);

    const updateCategoryStatus = useCallback(async (id, status) => {
        const updated = await menuService.updateCategoryStatus(id, status);
        setCategories((prev) =>
            prev.map((cat) => (cat.id === updated.id ? updated : cat)),
        );
        return updated;
    }, []);

    const value = {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        updateCategoryStatus,
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
}

export default CategoryContext;
