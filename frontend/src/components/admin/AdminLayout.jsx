import { Outlet } from "react-router-dom";
import AdminSidebarRefactored from "./AdminSidebar";

/**
 * AdminLayout - Refactored layout with new sidebar
 */
function AdminLayout() {
    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebarRefactored />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
