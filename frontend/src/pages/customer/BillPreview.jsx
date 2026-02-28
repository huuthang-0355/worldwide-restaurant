import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/useSession";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import { useToast } from "../../context/useToast";
import paymentService from "../../services/paymentService";
import { formatPrice } from "../../utils/formatCurrency";
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Receipt,
    UtensilsCrossed,
} from "lucide-react";

/**
 * BillPreview — "Your Bill" page matching payment.html mockup.
 *
 * Sections:
 *  - Bill header (restaurant name, table, date)
 *  - Itemized list grouped by order
 *  - Totals (subtotal, tax, service charge, grand total)
 *  - Payment method selection (Momo only for now per API contract)
 *  - Pay button
 */
function BillPreview() {
    const navigate = useNavigate();
    const { addSuccess, addError } = useToast();
    const { tableInfo } = useCustomerMenu();
    const {
        sessionId,
        billPreview,
        fetchBillPreview,
        requestBill,
        loading,
        error,
    } = useSession();

    const [billRequested, setBillRequested] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("momo");

    // Fetch bill preview on mount
    useEffect(() => {
        if (sessionId) fetchBillPreview();
    }, [sessionId, fetchBillPreview]);

    // ==================== Handlers ====================

    const handleRequestBill = async () => {
        try {
            await requestBill();
            setBillRequested(true);
            addSuccess("Bill requested! A waiter will come to your table.");
        } catch {
            addError("Failed to request bill. Please try again.");
        }
    };

    const handlePay = async () => {
        if (selectedPayment !== "momo") {
            addError("Only MoMo payment is currently supported.");
            return;
        }

        // If bill hasn't been requested yet, request it first
        if (!billRequested) {
            try {
                await requestBill();
                setBillRequested(true);
            } catch {
                addError("Failed to request bill.");
                return;
            }
        }

        try {
            setPaymentLoading(true);
            const returnUrl = `${window.location.origin}/menu/payment-result`;
            const data = await paymentService.initiateMomo(
                sessionId,
                returnUrl,
            );
            // Store payment ID for result page
            sessionStorage.setItem("lastPaymentId", data.paymentId);

            // Redirect to Momo payment URL (use web URL, not mobile deeplink)
            if (data.payUrl) {
                // Use payUrl for web browser payment
                window.location.href = data.payUrl;
            } else {
                console.error("Payment response:", data);
                addError("Payment URL not available. Please try again.");
            }
        } catch (err) {
            addError(
                err.response?.data?.message ||
                    "Failed to initiate payment. Please try again.",
            );
        } finally {
            setPaymentLoading(false);
        }
    };

    // ==================== Loading ====================
    if (loading && !billPreview) {
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-96">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Generating your bill...</p>
            </div>
        );
    }

    // ==================== Error ====================
    if (error && !billPreview) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Cannot Generate Bill
                </h2>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button
                    onClick={() => navigate("/menu/orders")}
                    className="bg-primary-500 text-white px-5 py-2 rounded-full text-sm font-medium"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    if (!billPreview) return null;

    const {
        items = [],
        subtotal = 0,
        taxRate = 0.1,
        taxAmount = 0,
        serviceChargeRate,
        serviceCharge = 0,
        totalAmount = 0,
    } = billPreview;

    const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const paymentMethods = [
        {
            id: "momo",
            label: "MoMo",
            color: "text-pink-600",
            letter: "M",
            fontBold: true,
        },
        {
            id: "counter",
            label: "Pay at Counter",
            icon: "💵",
        },
    ];

    // ==================== Render ====================
    return (
        <div className="pb-28">
            {/* Sub-header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                <button
                    onClick={() => navigate("/menu/orders")}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Your Bill</h1>
                <span className="ml-auto text-sm text-gray-500">
                    {tableInfo?.tableNumber || "Table"}
                </span>
            </div>

            <div className="px-4 py-4">
                {/* Bill Header */}
                <div className="text-center py-5 border-b-2 border-dashed border-gray-200 mb-5">
                    <UtensilsCrossed className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <h2 className="text-xl font-bold text-gray-800">
                        Smart Restaurant
                    </h2>
                    <p className="text-sm text-gray-500">
                        {tableInfo?.tableNumber || "Table"} | {today}
                    </p>
                </div>

                {/* Bill Items */}
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2">
                        <div className="flex gap-2 flex-1">
                            <span className="text-xs text-gray-400 font-medium w-6 shrink-0">
                                {item.quantity}x
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm text-gray-700 font-medium">
                                    {item.menuItemName}
                                </p>
                                {item.modifiers?.length > 0 && (
                                    <p className="text-xs text-gray-400">
                                        {item.modifiers.join(", ")}
                                    </p>
                                )}
                                {item.specialInstructions && (
                                    <p className="text-xs text-amber-500 italic">
                                        {item.specialInstructions}
                                    </p>
                                )}
                            </div>
                        </div>
                        <span className="text-sm text-gray-700 font-medium shrink-0">
                            {formatPrice(item.lineTotal)}
                        </span>
                    </div>
                ))}

                {/* Totals */}
                <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax ({Math.round(taxRate * 100)}%)</span>
                        <span>{formatPrice(taxAmount)}</span>
                    </div>
                    {serviceChargeRate > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>
                                Service Charge (
                                {Math.round(serviceChargeRate * 100)}%)
                            </span>
                            <span>{formatPrice(serviceCharge)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg text-gray-800">
                        <span>Total</span>
                        <span className="text-primary-600">
                            {formatPrice(totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 text-sm mb-3">
                        Payment Method
                    </h3>
                    <div className="space-y-2">
                        {paymentMethods.map((method) => (
                            <label
                                key={method.id}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                                    selectedPayment === method.id
                                        ? "border-primary-500 bg-primary-50"
                                        : "border-gray-200 bg-white"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    value={method.id}
                                    checked={selectedPayment === method.id}
                                    onChange={() =>
                                        setSelectedPayment(method.id)
                                    }
                                    className="accent-primary-500"
                                />
                                {method.icon ? (
                                    <span className="text-2xl">
                                        {method.icon}
                                    </span>
                                ) : (
                                    <span
                                        className={`text-2xl font-bold ${method.color}`}
                                    >
                                        {method.letter}
                                    </span>
                                )}
                                <span className="font-medium text-gray-700">
                                    {method.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Pay Button */}
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-97.5 bg-white border-t border-gray-200 p-4 z-40">
                {selectedPayment === "momo" ? (
                    <button
                        onClick={handlePay}
                        disabled={paymentLoading || loading}
                        className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {paymentLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Receipt className="w-5 h-5" />
                                Pay {formatPrice(totalAmount)}
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleRequestBill}
                        disabled={billRequested || loading}
                        className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {billRequested ? (
                            "✅ Bill Requested — Waiter will come"
                        ) : (
                            <>
                                <Receipt className="w-5 h-5" />
                                Request Bill – {formatPrice(totalAmount)}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default BillPreview;
