import { CustomerMenuProvider } from "../../context/CustomerMenuContext";
import { SessionProvider } from "../../context/SessionContext";
import CustomerLayout from "./CustomerLayout";

/**
 * CustomerProviderWrapper - Wraps CustomerLayout with required providers
 * for the customer-facing routes.
 */
function CustomerProviderWrapper() {
    return (
        <CustomerMenuProvider>
            <SessionProvider>
                <CustomerLayout />
            </SessionProvider>
        </CustomerMenuProvider>
    );
}

export default CustomerProviderWrapper;
