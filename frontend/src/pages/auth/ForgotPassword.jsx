import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "../../context/useToast";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

/**
 * ForgotPassword - Request password reset link
 * Only handles email submission, user receives link via email
 * @param {string} variant - "staff" or "customer"
 */
function ForgotPassword({ variant = "customer" }) {
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const isStaff = variant === "staff";
    const loginPath = isStaff ? "/admin/login" : "/login";
    const bgClass = isStaff
        ? "bg-gray-50"
        : "bg-linear-to-br from-primary-500 to-primary-600";

    const validateEmail = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setSubmitting(true);
        try {
            await authService.forgotPassword(email);
            setEmailSent(true);
            toast.success("Reset link sent to your email");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to send reset link"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Success screen after email is sent
    if (emailSent) {
        return (
            <div className={`min-h-screen ${bgClass} flex items-center justify-center py-12 px-4`}>
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="text-5xl mb-4">🍽️</div>
                        <h1 className={`text-2xl font-bold ${isStaff ? "text-gray-800" : "text-white"}`}>
                            Smart Restaurant
                        </h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Check Your Email
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We&apos;ve sent a password reset link to{" "}
                            <span className="font-medium">{email}</span>.
                            Please check your inbox and click the link to reset your password.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Didn&apos;t receive the email? Check your spam folder or{" "}
                            <button
                                onClick={() => setEmailSent(false)}
                                className="text-primary-500 hover:text-primary-600 font-medium"
                            >
                                try again
                            </button>
                        </p>
                        <Link
                            to={loginPath}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>

                    <p className={`text-center mt-8 text-sm ${isStaff ? "text-gray-400" : "text-white/70"}`}>
                        &copy; 2025 Smart Restaurant. All rights reserved.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bgClass} flex items-center justify-center py-12 px-4`}>
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🍽️</div>
                    <h1 className={`text-2xl font-bold ${isStaff ? "text-gray-800" : "text-white"}`}>
                        Smart Restaurant
                    </h1>
                    <p className={`text-sm mt-1 ${isStaff ? "text-gray-500" : "text-white/80"}`}>
                        {isStaff ? "Admin Dashboard" : "Reset Your Password"}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Forgot Password
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors({});
                            }}
                            error={errors.email}
                            placeholder="you@example.com"
                            icon={<Mail className="w-5 h-5" />}
                        />

                        <Button type="submit" className="w-full" loading={submitting}>
                            Send Reset Link
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
                <p className={`text-center mt-8 text-sm ${isStaff ? "text-gray-400" : "text-white/70"}`}>
                    &copy; 2025 Smart Restaurant. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
