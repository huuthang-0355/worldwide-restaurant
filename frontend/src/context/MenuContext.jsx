import { createContext, useState, useCallback } from "react";
import menuService from "../services/menuService";

const MenuContext = createContext();

/**
 * MenuProvider - Provides menu state and actions to child components
 */
export function MenuProvider({ children }) {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [itemsData, categoriesData] = await Promise.all([
                menuService.getAllMenuItems(),
                menuService.getAllCategories(),
            ]);

            setMenuItems(itemsData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load data");
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create menu item
    const createMenuItem = useCallback(async (formData) => {
        const newItem = await menuService.createMenuItem(formData);
        setMenuItems((prev) => [newItem, ...prev]);
        return newItem;
    }, []);

    // Update menu item
    const updateMenuItem = useCallback(async (id, formData) => {
        const updatedItem = await menuService.updateMenuItem(id, formData);
        setMenuItems((prev) =>
            prev.map((item) =>
                item.id === updatedItem.id ? updatedItem : item,
            ),
        );
        return updatedItem;
    }, []);

    // Delete menu item
    const deleteMenuItem = useCallback(async (id) => {
        await menuService.deleteMenuItem(id);
        setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    // Update menu item photos
    const updateMenuItemPhotos = useCallback((itemId, photos) => {
        setMenuItems((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, photos } : item,
            ),
        );
    }, []);

    // Assign modifier groups to menu item
    const assignModifierGroups = useCallback(
        async (itemId, modifierGroupIds) => {
            const updatedItem = await menuService.assignModifierGroups(
                itemId,
                modifierGroupIds,
            );
            setMenuItems((prev) =>
                prev.map((item) =>
                    item.id === updatedItem.id ? updatedItem : item,
                ),
            );
            return updatedItem;
        },
        [],
    );

    const value = {
        menuItems,
        categories,
        loading,
        error,
        fetchData,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        updateMenuItemPhotos,
        assignModifierGroups,
    };

    return (
        <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
    );
}

export default MenuContext;
