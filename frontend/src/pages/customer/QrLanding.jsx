import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import { Loader2, QrCode, AlertCircle } from "lucide-react";

/**
 * QrLanding — validates the QR token from the URL and redirects to the menu.
 *
 * Flow:
 *  1. Customer scans QR code → opens /menu?token=xxx
 *  2. This page extracts the token and calls verifyToken()
 *  3. On success → navigates to /menu/browse (the actual menu list)
 *  4. On failure → shows an error with a "Try Again" option
 */
function QrLanding() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyToken, sessionValid, loading, error } = useCustomerMenu();

    const qrToken = searchParams.get("token");

    useEffect(() => {
        if (qrToken) {
            verifyToken(qrToken);
        }
    }, [qrToken, verifyToken]);

    // Once session is validated, redirect to the menu list
    useEffect(() => {
        if (sessionValid) {
            navigate("/menu/browse", { replace: true });
        }
    }, [sessionValid, navigate]);

    // No token in URL at all
    if (!qrToken) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <QrCode className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Scan a QR Code
                </h2>
                <p className="text-gray-500 text-sm max-w-xs">
                    Please scan the QR code on your table to access the menu and
                    start ordering.
                </p>
            </div>
        );
    }

    // Validating token
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-500">Verifying your table…</p>
            </div>
        );
    }

    // Token validation failed
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Invalid QR Code
                </h2>
                <p className="text-gray-500 text-sm max-w-xs mb-6">{error}</p>
                <button
                    onClick={() => verifyToken(qrToken)}
                    className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return null;
}

export default QrLanding;
