import { useContext } from "react";
import CustomerMenuContext from "./CustomerMenuContext";

/**
 * Hook to access the CustomerMenu context.
 * Must be used within a CustomerMenuProvider.
 */
export function useCustomerMenu() {
    const context = useContext(CustomerMenuContext);
    if (!context) {
        throw new Error(
            "useCustomerMenu must be used within a CustomerMenuProvider",
        );
    }
    return context;
}
