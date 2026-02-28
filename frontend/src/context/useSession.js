import { useContext } from "react";
import SessionContext from "./SessionContext";

/**
 * Hook to access the Session context (cart, orders, bill).
 * Must be used within a SessionProvider.
 */
export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}
