import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";

/**
 * CustomerProtectedRoute - Guards routes that require customer authentication
 */
function CustomerProtectedRoute({ children }) {
    const { isCustomerAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="large" text="Loading..." />
            </div>
        );
    }

    if (!isCustomerAuthenticated) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default CustomerProtectedRoute;
