import { useContext } from "react";
import { ModifierContext } from "./ModifierContext";

/**
 * useModifier - Hook to access modifier context
 */
export function useModifier() {
    const context = useContext(ModifierContext);
    if (!context) {
        throw new Error("useModifier must be used within ModifierProvider");
    }
    return context;
}
