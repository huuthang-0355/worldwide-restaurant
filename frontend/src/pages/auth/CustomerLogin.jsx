import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import orderService from "../../services/orderService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const SESSION_ID_KEY = "restaurantSessionId";

/**
 * CustomerLogin - Customer login page
 */
function CustomerLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { customerLogin, isCustomerAuthenticated, error, clearError } =
        useAuth();
    const toast = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isCustomerAuthenticated) {
            const from = location.state?.from?.pathname || "/menu/browse";
            navigate(from, { replace: true });
        }
    }, [isCustomerAuthenticated, navigate, location]);

    // Clear error on unmount
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await customerLogin(formData);
            toast.success("Welcome back!");

            // Try to link user to current session (if any)
            const sessionId = localStorage.getItem(SESSION_ID_KEY);
            if (sessionId) {
                try {
                    await orderService.linkUserToSession(sessionId);
                } catch {
                    // Silent fail - user can still use the app
                }
            }

            const from = location.state?.from?.pathname || "/menu/browse";
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex flex-col">
            {/* Logo Section */}
            <div className="text-center py-12 px-5">
                <div className="text-6xl mb-4">🍽️</div>
                <h1 className="text-white text-3xl font-bold">
                    Smart Restaurant
                </h1>
                <p className="text-white/80 text-sm mt-1">
                    Scan. Order. Enjoy.
                </p>
            </div>

            {/* Login Form */}
            <div className="flex-1 bg-white rounded-t-3xl px-6 py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">
                    Welcome Back
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        error={errors.email}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        error={errors.password}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />

                    <div className="flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-red-500 hover:text-red-600"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        loading={submitting}
                    >
                        Sign In
                    </Button>
                </form>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-gray-500 text-sm">
                        or continue with
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Google Login (placeholder) */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </button>

                {/* Sign Up Link */}
                <p className="text-center mt-8 text-gray-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/register"
                        className="text-red-500 font-semibold hover:text-red-600"
                    >
                        Sign Up
                    </Link>
                </p>

                {/* Continue as Guest */}
                <div className="text-center mt-5">
                    <Link
                        to="/menu"
                        className="text-gray-500 text-sm hover:text-gray-700"
                    >
                        Continue as Guest →
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CustomerLogin;
