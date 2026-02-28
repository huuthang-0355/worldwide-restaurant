import { formatPrice } from "../../utils/formatCurrency";

/**
 * OrderSummary — displays subtotal, tax, and total (used in Cart and Bill pages).
 */
function OrderSummary({
    subtotal,
    taxRate = 0.1,
    taxAmount,
    total,
    className = "",
}) {
    // If taxAmount / total are not provided, compute from subtotal
    const computedTax = taxAmount ?? Math.round(subtotal * taxRate);
    const computedTotal = total ?? subtotal + computedTax;

    return (
        <div className={`bg-gray-50 rounded-2xl p-4 ${className}`}>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                Order Summary
            </h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Tax ({Math.round(taxRate * 100)}%)</span>
                    <span>{formatPrice(computedTax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800 text-base">
                    <span>Total</span>
                    <span className="text-primary-600">
                        {formatPrice(computedTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default OrderSummary;
