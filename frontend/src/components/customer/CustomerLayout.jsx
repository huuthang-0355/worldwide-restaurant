import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { User } from "lucide-react";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import { AuthContext } from "../../context/AuthContext";
import BottomNav from "./BottomNav";

/**
 * CustomerLayout — mobile-first shell for customer-facing pages.
 * Renders a primary-colored header with table number and a bottom nav bar.
 * Child routes render inside <Outlet />.
 */
function CustomerLayout() {
    const navigate = useNavigate();
    const { tableInfo } = useCustomerMenu();
    const authContext = useContext(AuthContext);
    const customerUser = authContext?.customerUser;

    return (
        <div className="max-w-97.5 mx-auto bg-white min-h-screen relative shadow-lg">
            {/* Header */}
            <div className="bg-primary-500 text-white px-5 py-5 flex items-center justify-between">
                <span className="text-xl font-bold">Smart Restaurant</span>
                <div className="flex items-center gap-3">
                    <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                        {tableInfo?.tableNumber || "Table"}
                    </span>
                    {customerUser ? (
                        <button
                            onClick={() => navigate("/menu/profile")}
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors border-2 border-white/30"
                            aria-label="Profile"
                        >
                            {customerUser.avatar ? (
                                <img
                                    src={customerUser.avatar}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-white/20 px-4 py-1.5 rounded-full text-sm hover:bg-white/30 transition-colors font-medium border border-white/30"
                        >
                            Login
                        </button>
                    )}
                </div>
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
