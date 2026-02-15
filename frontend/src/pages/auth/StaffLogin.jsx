import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

/**
 * StaffLogin - Admin/Staff login page
 */
function StaffLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { staffLogin, isStaffAuthenticated, error, clearError } = useAuth();
    const toast = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isStaffAuthenticated) {
            const from = location.state?.from?.pathname || "/admin/dashboard";
            navigate(from, { replace: true });
        }
    }, [isStaffAuthenticated, navigate, location]);

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
            await staffLogin(formData);
            toast.success("Welcome back!");
            const from = location.state?.from?.pathname || "/admin/dashboard";
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🍽️</div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Smart Restaurant
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Admin Dashboard
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            error={errors.email}
                            placeholder="admin@restaurant.com"
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
                                to="/admin/forgot-password"
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
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-gray-400 text-sm">
                    &copy; 2025 Smart Restaurant. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default StaffLogin;
