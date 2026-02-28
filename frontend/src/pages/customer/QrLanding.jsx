import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import { useSession } from "../../context/useSession";
import { Loader2, QrCode, AlertCircle } from "lucide-react";

/**
 * QrLanding — validates the QR token from the URL, starts a session,
 * and redirects to the menu.
 *
 * Flow:
 *  1. If session already exists (returning user) → redirect to /menu/browse
 *  2. Customer scans QR code → opens /menu?token=xxx
 *  3. This page extracts the token and calls verifyToken()
 *  4. On QR valid → auto-start session with table capacity
 *  5. On session created → navigates to /menu/browse
 *  6. On failure → shows an error with a "Try Again" option
 */
function QrLanding() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyToken, sessionValid, loading, error, token, tableInfo } =
        useCustomerMenu();
    const { startSession, sessionId } = useSession();

    const qrToken = searchParams.get("token");
    const [step, setStep] = useState("init"); // init | verifying | starting | error
    const [sessionError, setSessionError] = useState(null);
    const sessionStartedRef = useRef(false);

    // If session already exists (returning user with valid session), redirect immediately
    useEffect(() => {
        if (sessionValid && sessionId) {
            navigate("/menu/browse", { replace: true });
        }
    }, [sessionValid, sessionId, navigate]);

    // Step 1: Verify QR token when present
    useEffect(() => {
        if (qrToken && step === "init" && !sessionValid) {
            setStep("verifying");
            verifyToken(qrToken);
        }
    }, [qrToken, step, sessionValid, verifyToken]);

    // Step 2: Once QR is verified, auto-start session with table capacity
    useEffect(() => {
        const autoStartSession = async () => {
            if (
                sessionValid &&
                !sessionId &&
                !sessionStartedRef.current &&
                tableInfo
            ) {
                sessionStartedRef.current = true;
                setStep("starting");
                try {
                    // Use table capacity as guest count
                    const guestCount = tableInfo.capacity || 1;
                    await startSession(token || qrToken, guestCount);
                    navigate("/menu/browse", { replace: true });
                } catch (err) {
                    setSessionError(
                        err.response?.data?.message ||
                            "Failed to start session",
                    );
                    setStep("error");
                    sessionStartedRef.current = false;
                }
            }
        };
        autoStartSession();
    }, [
        sessionValid,
        sessionId,
        tableInfo,
        token,
        qrToken,
        startSession,
        navigate,
    ]);

    // No token in URL and no existing valid session
    if (!qrToken && !sessionValid) {
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

    // Validating token or starting session
    if (loading || step === "verifying" || step === "starting") {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-500">
                    {step === "starting"
                        ? "Starting your session…"
                        : "Verifying your table…"}
                </p>
            </div>
        );
    }

    // Token validation failed or session start failed
    if (error || step === "error") {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    {sessionError ? "Session Error" : "Invalid QR Code"}
                </h2>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                    {sessionError || error}
                </p>
                <button
                    onClick={() => {
                        setStep("init");
                        setSessionError(null);
                        sessionStartedRef.current = false;
                        if (qrToken) {
                            verifyToken(qrToken);
                        }
                    }}
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
