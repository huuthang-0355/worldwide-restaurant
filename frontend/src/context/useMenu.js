import { useContext } from "react";
import MenuContext from "./MenuContext";

/**
 * useMenu - Hook to access menu context
 */
export function useMenu() {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error("useMenu must be used within MenuProvider");
    }
    return context;
}
