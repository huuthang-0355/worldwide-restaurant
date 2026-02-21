import { Outlet } from "react-router-dom";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import BottomNav from "./BottomNav";

/**
 * CustomerLayout — mobile-first shell for customer-facing pages.
 * Renders a primary-colored header with table number and a bottom nav bar.
 * Child routes render inside <Outlet />.
 */
function CustomerLayout() {
    const { tableInfo } = useCustomerMenu();

    return (
        <div className="max-w-97.5 mx-auto bg-white min-h-screen relative shadow-lg">
            {/* Header */}
            <div className="bg-primary-500 text-white px-5 py-4 flex items-center justify-between">
                <span className="text-2xl">&#9776;</span>
                <span className="text-lg font-semibold">Smart Restaurant</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {tableInfo?.tableNumber || "Table"}
                </span>
            </div>

            {/* Page content — bottom padding for the fixed nav */}
            <div className="pb-20">
                <Outlet />
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}

export default CustomerLayout;
