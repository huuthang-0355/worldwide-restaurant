import OrderProgressBar from "./OrderProgressBar";
import { formatPrice } from "../../utils/formatCurrency";

/**
 * Status → badge config
 */
const STATUS_CONFIG = {
    PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    ACCEPTED: { label: "Accepted", className: "bg-blue-100 text-blue-700" },
    IN_KITCHEN: { label: "In Kitchen", className: "bg-blue-100 text-blue-700" },
    PREPARING: {
        label: "Preparing",
        className: "bg-orange-100 text-orange-700",
    },
    READY: { label: "Ready", className: "bg-green-100 text-green-700" },
    SERVED: { label: "Served", className: "bg-gray-100 text-gray-700" },
    COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-600" },
    REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

/**
 * Item status icons (matching order-status.html mockup)
 */
const ITEM_STATUS_DISPLAY = {
    PENDING: { icon: "⏳", label: "Queued", className: "text-yellow-600" },
    ACCEPTED: { icon: "✅", label: "Accepted", className: "text-green-600" },
    IN_KITCHEN: { icon: "🔥", label: "In Kitchen", className: "text-blue-600" },
    PREPARING: { icon: "🔥", label: "Cooking", className: "text-orange-600" },
    READY: { icon: "✅", label: "Ready", className: "text-green-600" },
    SERVED: { icon: "✅", label: "Served", className: "text-gray-600" },
    REJECTED: { icon: "❌", label: "Rejected", className: "text-red-600" },
};

/**
 * OrderCard — displays a single order with progress bar, items, and total.
 * Matches the order-status.html mockup.
 */
function OrderCard({ order, index }) {
    const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

    // Calculate time ago
    const createdAt = order.createdAt ? new Date(order.createdAt) : null;
    const timeAgo = createdAt ? getTimeAgo(createdAt) : "";

    // Check if order is ready (show notification banner)
    const isReady = order.status === "READY";
    const isCancelled = order.status === "CANCELLED";

    // Calculate order total excluding rejected items
    // Use item-level lineTotal when available, otherwise fall back to order's totalAmount
    const calculateValidTotal = () => {
        if (isCancelled) return 0;

        // If items have lineTotal, calculate sum of non-rejected items
        const hasItemTotals = order.items?.some(
            (item) => item.lineTotal != null,
        );
        if (hasItemTotals) {
            return order.items
                .filter((item) => item.status !== "REJECTED")
                .reduce((sum, item) => sum + (item.lineTotal || 0), 0);
        }

        // Fall back to order's totalAmount
        return order.totalAmount || order.subtotal || 0;
    };

    const displayTotal = calculateValidTotal();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4">
                <div>
                    <span className="font-bold text-gray-800 text-sm">
                        {order.orderNumber || `Order #${index + 1}`}
                    </span>
                    {timeAgo && (
                        <span className="text-xs text-gray-400 ml-2">
                            {timeAgo}
                        </span>
                    )}
                </div>
                <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConf.className}`}
                >
                    {statusConf.label}
                </span>
            </div>

            {/* Progress Bar (hide for cancelled orders) */}
            {!isCancelled && (
                <div className="px-4">
                    <OrderProgressBar status={order.status} />
                </div>
            )}

            {/* Cancelled notification */}
            {isCancelled && (
                <div className="mx-4 my-3 bg-red-50 text-red-800 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <span className="text-lg">❌</span>
                    <span className="font-medium">
                        This order was cancelled. All items were rejected.
                    </span>
                </div>
            )}

            {/* Ready notification */}
            {isReady && (
                <div className="mx-4 mb-3 bg-green-50 text-green-800 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <span className="text-lg">🎉</span>
                    <span className="font-medium">
                        Your order is ready! Please pick up at the counter.
                    </span>
                </div>
            )}

            {/* Items */}
            <div className="px-4 space-y-2">
                {order.items?.map((item) => {
                    const itemStatus =
                        ITEM_STATUS_DISPLAY[item.status] ||
                        ITEM_STATUS_DISPLAY.PENDING;
                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between py-1.5 border-t border-gray-50 first:border-t-0"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-medium w-6">
                                    {item.quantity}x
                                </span>
                                <span className="text-sm text-gray-700">
                                    {item.menuItemName}
                                </span>
                            </div>
                            <span
                                className={`text-xs font-medium ${itemStatus.className}`}
                            >
                                {itemStatus.icon} {itemStatus.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Order Total */}
            <div className="flex justify-between items-center px-4 py-3 mt-2 border-t border-gray-100 bg-gray-50/50">
                <span className="text-sm text-gray-500">Order Total</span>
                <span className="font-bold text-gray-800">
                    {formatPrice(displayTotal)}
                </span>
            </div>
        </div>
    );
}

/**
 * Utility: human-readable time ago string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

export default OrderCard;
