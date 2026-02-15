import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "../../context/useToast";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

/**
 * ResetPassword - Reset password using token from URL
 * Extracts token from query params: /reset-password?token=xxx
 * @param {string} variant - "staff" or "customer"
 */
function ResetPassword({ variant = "customer" }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const isStaff = variant === "staff";
    const loginPath = isStaff ? "/admin/login" : "/login";
    const bgClass = isStaff
        ? "bg-gray-50"
        : "bg-linear-to-br from-primary-500 to-primary-600";

    // Check for token on mount
    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token");
        }
    }, [token]);

    const validateForm = () => {
        const newErrors = {};

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            await authService.resetPassword({
                token,
                newPassword: password,
                confirmPassword,
            });
            setSuccess(true);
            toast.success("Password reset successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to reset password",
            );
        } finally {
            setSubmitting(false);
        }
    };

    // No token state
    if (!token) {
        return (
            <div
                className={`min-h-screen ${bgClass} flex items-center justify-center py-12 px-4`}
            >
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="text-5xl mb-4">🍽️</div>
                        <h1
                            className={`text-2xl font-bold ${isStaff ? "text-gray-800" : "text-white"}`}
                        >
                            Smart Restaurant
                        </h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Invalid Reset Link
                        </h2>
                        <p className="text-gray-600 mb-6">
                            The password reset link is invalid or has expired.
                            Please request a new one.
                        </p>
                        <Link
                            to={
                                isStaff
                                    ? "/admin/forgot-password"
                                    : "/forgot-password"
                            }
                            className="inline-block"
                        >
                            <Button>Request New Link</Button>
                        </Link>
                    </div>

                    <p
                        className={`text-center mt-8 text-sm ${isStaff ? "text-gray-400" : "text-white/70"}`}
                    >
                        &copy; 2025 Smart Restaurant. All rights reserved.
                    </p>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div
                className={`min-h-screen ${bgClass} flex items-center justify-center py-12 px-4`}
            >
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="text-5xl mb-4">🍽️</div>
                        <h1
                            className={`text-2xl font-bold ${isStaff ? "text-gray-800" : "text-white"}`}
                        >
                            Smart Restaurant
                        </h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Password Reset Successfully
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your password has been changed. You can now log in
                            with your new password.
                        </p>
                        <Button onClick={() => navigate(loginPath)}>
                            Go to Login
                        </Button>
                    </div>

                    <p
                        className={`text-center mt-8 text-sm ${isStaff ? "text-gray-400" : "text-white/70"}`}
                    >
                        &copy; 2025 Smart Restaurant. All rights reserved.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen ${bgClass} flex items-center justify-center py-12 px-4`}
        >
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🍽️</div>
                    <h1
                        className={`text-2xl font-bold ${isStaff ? "text-gray-800" : "text-white"}`}
                    >
                        Smart Restaurant
                    </h1>
                    <p
                        className={`text-sm mt-1 ${isStaff ? "text-gray-500" : "text-white/80"}`}
                    >
                        {isStaff ? "Admin Dashboard" : "Create New Password"}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Reset Your Password
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        password: null,
                                    }));
                                }
                            }}
                            error={errors.password}
                            placeholder="Enter new password"
                            icon={<Lock className="w-5 h-5" />}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        confirmPassword: null,
                                    }));
                                }
                            }}
                            error={errors.confirmPassword}
                            placeholder="Confirm new password"
                            icon={<Lock className="w-5 h-5" />}
                        />

                        <div className="text-sm text-gray-500">
                            Password must be at least 6 characters long.
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={submitting}
                        >
                            Reset Password
                        </Button>

                        <Link
                            to={loginPath}
                            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </form>
                </div>

                {/* Footer */}
                <p
                    className={`text-center mt-8 text-sm ${isStaff ? "text-gray-400" : "text-white/70"}`}
                >
                    &copy; 2025 Smart Restaurant. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;
