import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardList,
    Utensils,
    FolderOpen,
    Settings2,
    Users,
    BarChart3,
    Monitor,
    LogOut,
    UtensilsCrossed,
} from "lucide-react";
import Badge from "../ui/Badge";

/**
 * AdminSidebar - Refactored navigation sidebar with lucide icons
 */
function AdminSidebar() {
    const navItems = [
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        {
            path: "/admin/orders",
            icon: ClipboardList,
            label: "Orders",
            badge: 5,
        },
        { path: "/admin/menu", icon: Utensils, label: "Menu Items" },
        { path: "/admin/categories", icon: FolderOpen, label: "Categories" },
        { path: "/admin/modifiers", icon: Settings2, label: "Modifiers" },
        { path: "/admin/tables", icon: UtensilsCrossed, label: "Tables" },
        { path: "/admin/staff", icon: Users, label: "Kitchen Staff" },
        { path: "/admin/reports", icon: BarChart3, label: "Reports" },
        { path: "/admin/kds", icon: Monitor, label: "Kitchen Display" },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Utensils className="w-8 h-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-800">
                        Smart Restaurant
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors relative ${
                                    isActive
                                        ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                                        : ""
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            {item.badge && (
                                <Badge variant="danger" className="ml-auto">
                                    {item.badge}
                                </Badge>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        JD
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">
                            John Doe
                        </div>
                        <div className="text-xs text-gray-500">
                            Restaurant Admin
                        </div>
                    </div>
                </div>
                <button className="w-full flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default AdminSidebar;
