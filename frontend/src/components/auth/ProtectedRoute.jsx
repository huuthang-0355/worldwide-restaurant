import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

/**
 * ProtectedRoute - Guards routes that require staff authentication
 * @param {Array} allowedRoles - Optional array of roles that can access this route
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
    const { staffUser, isStaffAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="large" text="Loading..." />
            </div>
        );
    }

    if (!isStaffAuthenticated) {
        // Redirect to login, preserving the intended destination
        return (
            <Navigate to="/admin/login" state={{ from: location }} replace />
        );
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(staffUser?.role)) {
        // User doesn't have required role - redirect to dashboard
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
