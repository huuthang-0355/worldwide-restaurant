import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useToast } from "../../context/useToast";
import authService from "../../services/authService";
import Button from "../../components/ui/Button";

/**
 * VerifyEmail - Verify email using token from URL
 * Extracts token from query params: /verify-email?token=xxx
 * @param {string} variant - "staff" or "customer"
 */
function VerifyEmail({ variant = "customer" }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();

    const token = searchParams.get("token");

    const [status, setStatus] = useState("loading"); // loading, success, error
    const [errorMessage, setErrorMessage] = useState("");

    const isStaff = variant === "staff";
    const loginPath = isStaff ? "/admin/login" : "/login";
    const bgClass = isStaff
        ? "bg-gray-50"
        : "bg-linear-to-br from-primary-500 to-primary-600";

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus("error");
                setErrorMessage("Invalid or missing verification token.");
                return;
            }

            try {
                await authService.verifyEmail(token);
                setStatus("success");
                toast.success("Email verified successfully!");
            } catch (err) {
                setStatus("error");
                setErrorMessage(
                    err.response?.data?.message ||
                        "Failed to verify email. The link may be expired.",
                );
                toast.error("Email verification failed");
            }
        };

        verifyToken();
    }, [token]);

    // Loading state
    if (status === "loading") {
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
                        <Loader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Verifying Your Email
                        </h2>
                        <p className="text-gray-600">
                            Please wait while we verify your email address...
                        </p>
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
    if (status === "success") {
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
                            Email Verified!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your email address has been verified successfully.
                            You can now log in to your account.
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

    // Error state
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
                        Verification Failed
                    </h2>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    <div className="space-y-3">
                        <Link to={isStaff ? "/admin/register" : "/register"}>
                            <Button variant="outline" className="w-full">
                                Request New Verification
                            </Button>
                        </Link>
                        <Link to={loginPath}>
                            <Button variant="ghost" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
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

export default VerifyEmail;
