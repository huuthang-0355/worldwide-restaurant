import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/useSession";
import OrderCard from "../../components/customer/OrderCard";
import { formatPrice } from "../../utils/formatCurrency";
import {
    ClipboardList,
    Loader2,
    AlertCircle,
    UtensilsCrossed,
    Package,
    ShoppingBag,
} from "lucide-react";

/**
 * CustomerOrders — order tracking page matching order-status.html mockup.
 *
 * Sections:
 *  - Session summary card (total, order count, item count)
 *  - List of orders with progress bars and item statuses
 *  - "Browse Menu" prompt at the bottom
 */
function CustomerOrders() {
    const navigate = useNavigate();
    const { orders, fetchOrders, loading, error, sessionId } = useSession();

    // Fetch orders on mount and set up polling
    const loadOrders = useCallback(() => {
        if (sessionId) fetchOrders();
    }, [sessionId, fetchOrders]);

    useEffect(() => {
        loadOrders();
        // Poll every 15 seconds for status updates
        const interval = setInterval(loadOrders, 15000);
        return () => clearInterval(interval);
    }, [loadOrders]);

    // ==================== Computed Values ====================
    // Filter out cancelled orders from session total
    const activeOrders = orders.filter(
        (o) => o.status !== "CANCELLED" && o.status !== "REJECTED",
    );

    // Calculate total amount excluding rejected items
    // Use item-level lineTotal when available
    const calculateOrderTotal = (order) => {
        const hasItemTotals = order.items?.some(
            (item) => item.lineTotal != null,
        );
        if (hasItemTotals) {
            return order.items
                .filter((item) => item.status !== "REJECTED")
                .reduce((sum, item) => sum + (item.lineTotal || 0), 0);
        }
        return order.totalAmount || order.subtotal || 0;
    };

    const totalAmount = activeOrders.reduce(
        (sum, o) => sum + calculateOrderTotal(o),
        0,
    );
    const totalItems = activeOrders.reduce(
        (sum, o) =>
            sum +
            (o.items?.filter((i) => i.status !== "REJECTED")?.length || 0),
        0,
    );

    // ==================== Loading State ====================
    if (loading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-96">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Loading your orders...</p>
            </div>
        );
    }

    // ==================== Error State ====================
    if (error && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Something went wrong
                </h2>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button
                    onClick={loadOrders}
                    className="bg-primary-500 text-white px-5 py-2 rounded-full text-sm font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ==================== Empty State ====================
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <ClipboardList className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    No Orders Yet
                </h2>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                    Add items to your cart and place an order to see them here.
                </p>
                <button
                    onClick={() => navigate("/menu/browse")}
                    className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition-colors"
                >
                    <UtensilsCrossed className="w-4 h-4 inline mr-2" />
                    Browse Menu
                </button>
            </div>
        );
    }

    // ==================== Render ====================
    return (
        <div className="pb-24">
            {/* Session Summary Card */}
            <div className="mx-4 mt-4 bg-linear-to-br from-primary-500 to-primary-700 text-white p-5 rounded-2xl">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm opacity-90">
                            Current Session Total
                        </p>
                        <p className="text-3xl font-bold mt-1">
                            {formatPrice(totalAmount)}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/menu/bill")}
                        className="bg-white text-primary-500 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
                    >
                        Request Bill
                    </button>
                </div>
                <div className="flex gap-5 mt-4 pt-4 border-t border-white/30 text-sm">
                    <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4" />
                        {orders.length} Order{orders.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" />
                        {totalItems} Item{totalItems !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Orders List — newest first */}
            <div className="px-4 mt-4 space-y-4">
                {[...orders]
                    .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
                    .map((order, idx) => (
                        <OrderCard
                            key={order.orderId}
                            order={order}
                            index={orders.length - 1 - idx}
                        />
                    ))}
            </div>

            {/* Browse Menu Prompt */}
            <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-3">
                    Want to order more?
                </p>
                <button
                    onClick={() => navigate("/menu/browse")}
                    className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-primary-600 transition-colors"
                >
                    🍽️ Browse Menu
                </button>
            </div>
        </div>
    );
}

export default CustomerOrders;
