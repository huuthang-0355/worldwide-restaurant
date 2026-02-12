import { createContext, useState, useCallback } from "react";
import modifierService from "../services/modifierService";

export const ModifierContext = createContext();

/**
 * ModifierProvider - Provides modifier group state and actions
 */
export function ModifierProvider({ children }) {
    const [modifierGroups, setModifierGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchModifierGroups = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await modifierService.getAllModifierGroups();
            setModifierGroups(data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load modifier groups",
            );
            console.error("Error fetching modifier groups:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createModifierGroup = useCallback(async (data) => {
        const newGroup = await modifierService.createModifierGroup(data);
        setModifierGroups((prev) => [...prev, newGroup]);
        return newGroup;
    }, []);

    const updateModifierGroup = useCallback(async (id, data) => {
        const updated = await modifierService.updateModifierGroup(id, data);
        setModifierGroups((prev) => {
            const newGroups = prev.map((g) =>
                g.id === updated.id ? updated : g,
            );
            return newGroups;
        });
        return updated;
    }, []);

    const createModifierOption = useCallback(async (groupId, data) => {
        const newOption = await modifierService.createModifierOption(
            groupId,
            data,
        );
        setModifierGroups((prev) =>
            prev.map((g) =>
                g.id === groupId
                    ? { ...g, options: [...(g.options || []), newOption] }
                    : g,
            ),
        );
        return newOption;
    }, []);

    const updateModifierOption = useCallback(
        async (groupId, optionId, data) => {
            const updated = await modifierService.updateModifierOption(
                optionId,
                data,
            );
            setModifierGroups((prev) =>
                prev.map((g) =>
                    g.id === groupId
                        ? {
                              ...g,
                              options: (g.options || []).map((o) =>
                                  o.id === updated.id ? updated : o,
                              ),
                          }
                        : g,
                ),
            );
            return updated;
        },
        [],
    );

    const value = {
        modifierGroups,
        loading,
        error,
        fetchModifierGroups,
        createModifierGroup,
        updateModifierGroup,
        createModifierOption,
        updateModifierOption,
    };

    return (
        <ModifierContext.Provider value={value}>
            {children}
        </ModifierContext.Provider>
    );
}

export default ModifierContext;
