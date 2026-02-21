import { createContext, useState, useCallback, useEffect } from "react";
import authService from "../services/authService";
import { setPortalContext } from "../services/apiClient";

export const AuthContext = createContext();

/**
 * AuthProvider - Provides authentication state and actions
 * Supports both staff and customer authentication with separate tokens
 */
export function AuthProvider({ children }) {
    const [staffUser, setStaffUser] = useState(null);
    const [customerUser, setCustomerUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing tokens on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check staff token
                if (authService.isAuthenticated("staff")) {
                    setPortalContext("staff");
                    try {
                        const profile = await authService.getProfile();
                        setStaffUser(profile);
                    } catch {
                        // Profile fetch failed (CORS or token invalid)
                        // Keep user as authenticated if token exists
                        setStaffUser({ authenticated: true });
                    }
                }

                // Check customer token
                if (authService.isAuthenticated("customer")) {
                    setPortalContext("customer");
                    try {
                        const profile = await authService.getProfile();
                        setCustomerUser(profile);
                    } catch {
                        // Profile fetch failed (CORS or token invalid)
                        setCustomerUser({ authenticated: true });
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // ==================== Staff Authentication ====================

    const staffLogin = useCallback(async (credentials) => {
        try {
            setError(null);
            setPortalContext("staff");
            const { user, token } = await authService.login(
                credentials,
                "staff",
            );

            // If API returns user object, use it; otherwise fetch profile
            let userData = user;
            if (!userData && token) {
                try {
                    userData = await authService.getProfile();
                } catch {
                    // Profile fetch failed but login succeeded
                    // Set minimal user data based on token existence
                    userData = { authenticated: true };
                }
            }

            setStaffUser(userData);
            return userData;
        } catch (err) {
            const message = err.response?.data?.message || "Login failed";
            setError(message);
            throw err;
        }
    }, []);

    const staffLogout = useCallback(() => {
        authService.logout("staff");
        setStaffUser(null);
    }, []);

    const refreshStaffUser = useCallback(async () => {
        if (!authService.isAuthenticated("staff")) return;
        setPortalContext("staff");
        try {
            const profile = await authService.getProfile();
            setStaffUser(profile);
            return profile;
        } catch {
            // Profile fetch failed
            return null;
        }
    }, []);

    // ==================== Customer Authentication ====================

    const customerLogin = useCallback(async (credentials) => {
        try {
            setError(null);
            setPortalContext("customer");
            const { user, token } = await authService.login(
                credentials,
                "customer",
            );

            // If API returns user object, use it; otherwise fetch profile
            let userData = user;
            if (!userData && token) {
                try {
                    userData = await authService.getProfile();
                } catch {
                    userData = { authenticated: true };
                }
            }

            setCustomerUser(userData);
            return userData;
        } catch (err) {
            const message = err.response?.data?.message || "Login failed";
            setError(message);
            throw err;
        }
    }, []);

    const customerRegister = useCallback(async (data) => {
        try {
            setError(null);
            const result = await authService.register(data);
            return result;
        } catch (err) {
            const message =
                err.response?.data?.message || "Registration failed";
            setError(message);
            throw err;
        }
    }, []);

    const customerLogout = useCallback(() => {
        authService.logout("customer");
        setCustomerUser(null);
    }, []);

    const refreshCustomerUser = useCallback(async () => {
        if (!authService.isAuthenticated("customer")) return;
        setPortalContext("customer");
        try {
            const profile = await authService.getProfile();
            setCustomerUser(profile);
            return profile;
        } catch {
            return null;
        }
    }, []);

    // ==================== Shared Actions ====================

    const forgotPassword = useCallback(async (email) => {
        try {
            setError(null);
            return await authService.forgotPassword(email);
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to send reset email";
            setError(message);
            throw err;
        }
    }, []);

    const resetPassword = useCallback(async (data) => {
        try {
            setError(null);
            return await authService.resetPassword(data);
        } catch (err) {
            const message =
                err.response?.data?.message || "Failed to reset password";
            setError(message);
            throw err;
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ==================== Permission Checks ====================

    const isStaffAuthenticated = Boolean(staffUser);
    const isCustomerAuthenticated = Boolean(customerUser);

    const hasRole = useCallback(
        (role) => {
            if (!staffUser) return false;
            return staffUser.role === role;
        },
        [staffUser],
    );

    const isAdmin = hasRole("ADMIN");
    const isWaiter = hasRole("WAITER");
    const isKitchenStaff = hasRole("KITCHEN_STAFF");

    return (
        <AuthContext.Provider
            value={{
                // State
                staffUser,
                customerUser,
                loading,
                error,

                // Staff actions
                staffLogin,
                staffLogout,
                refreshStaffUser,
                isStaffAuthenticated,

                // Customer actions
                customerLogin,
                customerRegister,
                customerLogout,
                refreshCustomerUser,
                isCustomerAuthenticated,

                // Shared actions
                forgotPassword,
                resetPassword,
                clearError,

                // Permission checks
                hasRole,
                isAdmin,
                isWaiter,
                isKitchenStaff,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
