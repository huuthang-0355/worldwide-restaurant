import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { User, Mail, Lock, CheckCircle, ArrowLeft } from "lucide-react";

/**
 * CustomerRegister - Customer registration page
 */
function CustomerRegister() {
    const navigate = useNavigate();
    const { isCustomerAuthenticated } = useAuth();
    const toast = useToast();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isCustomerAuthenticated) {
            navigate("/profile", { replace: true });
        }
    }, [isCustomerAuthenticated, navigate]);

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = "Password must contain an uppercase letter";
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = "Password must contain a lowercase letter";
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain a number";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
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
            // Check email availability first
            const emailCheck = await authService.checkEmail(formData.email);
            if (!emailCheck.success) {
                setErrors({ email: "This email is already registered" });
                setSubmitting(false);
                return;
            }

            // Register user
            await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: "CUSTOMER",
            });

            setSuccess(true);
            toast.success(
                "Account created! Please check your email to verify.",
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-600 flex flex-col">
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Account Created!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We&apos;ve sent a verification email to{" "}
                            <span className="font-medium">
                                {formData.email}
                            </span>
                            . Please check your inbox and verify your email to
                            continue.
                        </p>
                        <Button
                            onClick={() => navigate("/login")}
                            className="w-full"
                        >
                            Go to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-600 flex flex-col">
            {/* Logo Section */}
            <div className="text-center py-8 px-5">
                <div className="text-5xl mb-2">🍽️</div>
                <h1 className="text-white text-2xl font-bold">
                    Smart Restaurant
                </h1>
                <p className="text-white/80 text-sm mt-1">
                    Create Your Account
                </p>
            </div>

            {/* Register Form */}
            <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Sign Up
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="First Name"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange("firstName")}
                            error={errors.firstName}
                            placeholder="John"
                            icon={<User className="w-5 h-5" />}
                        />
                        <Input
                            label="Last Name"
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange("lastName")}
                            error={errors.lastName}
                            placeholder="Doe"
                        />
                    </div>

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        error={errors.email}
                        placeholder="you@example.com"
                        icon={<Mail className="w-5 h-5" />}
                        autoComplete="email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        error={errors.password}
                        placeholder="At least 8 characters"
                        icon={<Lock className="w-5 h-5" />}
                        autoComplete="new-password"
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        error={errors.confirmPassword}
                        placeholder="Confirm your password"
                        icon={<Lock className="w-5 h-5" />}
                        autoComplete="new-password"
                    />

                    {/* Password requirements */}
                    <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-600">
                            Password must have:
                        </p>
                        <ul className="grid grid-cols-2 gap-1">
                            <li
                                className={
                                    formData.password.length >= 8
                                        ? "text-green-600"
                                        : ""
                                }
                            >
                                • At least 8 characters
                            </li>
                            <li
                                className={
                                    /[A-Z]/.test(formData.password)
                                        ? "text-green-600"
                                        : ""
                                }
                            >
                                • One uppercase letter
                            </li>
                            <li
                                className={
                                    /[a-z]/.test(formData.password)
                                        ? "text-green-600"
                                        : ""
                                }
                            >
                                • One lowercase letter
                            </li>
                            <li
                                className={
                                    /[0-9]/.test(formData.password)
                                        ? "text-green-600"
                                        : ""
                                }
                            >
                                • One number
                            </li>
                        </ul>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        loading={submitting}
                    >
                        Create Account
                    </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Back Link */}
                <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default CustomerRegister;
