import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, ClipboardList, Receipt } from "lucide-react";
import { useSession } from "../../context/useSession";

/**
 * BottomNav — fixed bottom navigation matching the customer mockup.
 * Four tabs: Menu, Cart (with badge), Orders, Bill.
 */
function BottomNav() {
    const { cartCount } = useSession();

    const navItems = [
        { to: "/menu/browse", icon: Home, label: "Menu" },
        {
            to: "/menu/cart",
            icon: ShoppingCart,
            label: "Cart",
            badge: cartCount > 0 ? cartCount : null,
        },
        { to: "/menu/orders", icon: ClipboardList, label: "Orders" },
        { to: "/menu/bill", icon: Receipt, label: "Bill" },
    ];

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-97.5 bg-white flex justify-around py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `flex flex-col items-center text-xs cursor-pointer ${
                            isActive ? "text-primary-500" : "text-gray-400"
                        }`
                    }
                >
                    <span className="relative mb-1">
                        <Icon className="w-6 h-6" />
                        {badge != null && (
                            <span className="absolute -top-1.5 -right-2.5 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                                {badge}
                            </span>
                        )}
                    </span>
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

export default BottomNav;
