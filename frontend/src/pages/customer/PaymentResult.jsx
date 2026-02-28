import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import paymentService from "../../services/paymentService";
import { formatPrice } from "../../utils/formatCurrency";
import {
    CheckCircle,
    XCircle,
    Loader2,
    Clock,
    ArrowRight,
} from "lucide-react";

/**
 * PaymentResult — landing page after Momo payment redirect.
 *
 * Reads paymentId from sessionStorage or URL params, polls status,
 * and shows success/failure/pending states.
 */
function PaymentResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState(null); // full PaymentStatusResponse
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get paymentId from sessionStorage or URL query
    const paymentId =
        searchParams.get("paymentId") ||
        sessionStorage.getItem("lastPaymentId");

    useEffect(() => {
        if (!paymentId) {
            setLoading(false);
            setError("No payment information found.");
            return;
        }

        let cancelled = false;
        let pollCount = 0;
        const maxPolls = 12; // Poll for ~1 minute

        const checkStatus = async () => {
            try {
                const data = await paymentService.checkStatus(paymentId);
                if (cancelled) return;
                setStatus(data);

                // If still pending/processing, poll again
                if (
                    (data.status === "PENDING" ||
                        data.status === "PROCESSING") &&
                    pollCount < maxPolls
                ) {
                    pollCount++;
                    setTimeout(checkStatus, 5000);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                if (cancelled) return;
                setError(
                    err.response?.data?.message ||
                        "Failed to check payment status",
                );
                setLoading(false);
            }
        };

        checkStatus();
        return () => {
            cancelled = true;
        };
    }, [paymentId]);

    // ==================== Render States ====================

    // Still loading / polling
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-96 text-center">
                <Loader2 className="w-14 h-14 text-primary-500 animate-spin mb-4" />
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Processing Payment
                </h2>
                <p className="text-sm text-gray-500 max-w-xs">
                    Please wait while we confirm your payment with MoMo...
                </p>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-96 text-center">
                <XCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Payment Error
                </h2>
                <p className="text-sm text-gray-500 max-w-xs mb-6">{error}</p>
                <button
                    onClick={() => navigate("/menu/orders")}
                    className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold text-sm"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    // Payment completed successfully
    if (status?.status === "COMPLETED") {
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-96 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Successful!
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                    Amount paid:{" "}
                    <strong className="text-gray-700">
                        {formatPrice(status.totalAmount)}
                    </strong>
                </p>
                {status.paymentReference && (
                    <p className="text-xs text-gray-400 mb-6">
                        Ref: {status.paymentReference}
                    </p>
                )}
                <p className="text-sm text-gray-500 max-w-xs mb-8">
                    Thank you for dining with us! Your session has been
                    completed.
                </p>
                <button
                    onClick={() => navigate("/menu")}
                    className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2"
                >
                    Done
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // Payment failed
    if (status?.status === "FAILED") {
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-96 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Payment Failed
                </h2>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                    Your payment could not be processed. Please try again or
                    choose a different payment method.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/menu/bill")}
                        className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold text-sm"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate("/menu/orders")}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold text-sm"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    // Payment still pending (timeout reached)
    return (
        <div className="flex flex-col items-center justify-center p-10 min-h-96 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Payment Pending
            </h2>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
                We haven&apos;t received confirmation yet. This may take a few
                minutes. Please check your MoMo app for the transaction status.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        window.location.reload();
                    }}
                    className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold text-sm"
                >
                    Check Again
                </button>
                <button
                    onClick={() => navigate("/menu/orders")}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold text-sm"
                >
                    Back to Orders
                </button>
            </div>
        </div>
    );
}

export default PaymentResult;
