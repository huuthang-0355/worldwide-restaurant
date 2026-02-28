import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardList,
    Utensils,
    FolderOpen,
    Settings2,
    Users,
    Monitor,
    LogOut,
    LayoutGrid,
    User,
} from "lucide-react";
import Badge from "../ui/Badge";
import { useAuth } from "../../context/useAuth";

/**
 * AdminSidebar - Refactored navigation sidebar with lucide icons
 */
function AdminSidebar() {
    const navigate = useNavigate();
    const { staffUser, staffLogout } = useAuth();
    const navItems = [
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/orders", icon: ClipboardList, label: "Orders" },
        { path: "/admin/menu", icon: Utensils, label: "Menu Items" },
        { path: "/admin/categories", icon: FolderOpen, label: "Categories" },
        { path: "/admin/modifiers", icon: Settings2, label: "Modifiers" },
        { path: "/admin/tables", icon: LayoutGrid, label: "Tables" },
        { path: "/admin/staff", icon: Users, label: "Staff" },
        { path: "/admin/kds", icon: Monitor, label: "Kitchen Display" },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Utensils className="w-8 h-8 text-primary-500" />
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
                                        ? "bg-primary-50 text-primary-600 border-r-4 border-primary-600"
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
                <NavLink
                    to="/admin/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                            isActive ? "bg-primary-50" : ""
                        }`
                    }
                >
                    <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                        {staffUser?.firstName?.[0] || "U"}
                        {staffUser?.lastName?.[0] || ""}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">
                            {staffUser?.firstName || "User"}{" "}
                            {staffUser?.lastName || ""}
                        </div>
                        <div className="text-xs text-gray-500">
                            {staffUser?.role?.replace("_", " ") || "Staff"}
                        </div>
                    </div>
                </NavLink>
                <button
                    onClick={() => {
                        staffLogout();
                        navigate("/admin/login");
                    }}
                    className="w-full flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default AdminSidebar;
