import { useState, useEffect, useCallback } from "react";
import {
    ChefHat,
    Clock,
    Flame,
    CheckCircle,
    RefreshCw,
    Loader2,
    AlertTriangle,
    Timer,
    ArrowRight,
    UtensilsCrossed,
} from "lucide-react";
import { useToast } from "../../context/useToast";
import kitchenService from "../../services/kitchenService";

/**
 * KitchenDisplay - Kitchen Display System (KDS)
 *
 * Features:
 *  - Stats cards showing order counts and average prep time
 *  - Three columns: In Kitchen, Preparing, Ready
 *  - Click to advance order status
 */
function KitchenDisplay() {
    const { addSuccess, addError } = useToast();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Orders by status
    const [inKitchenOrders, setInKitchenOrders] = useState([]);
    const [preparingOrders, setPreparingOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);

    // Stats
    const [stats, setStats] = useState({
        inKitchen: 0,
        preparing: 0,
        ready: 0,
        avgPrepTime: 0,
    });

    // Processing state for status updates
    const [processingOrders, setProcessingOrders] = useState({});

    // ==================== Data Fetching ====================

    const fetchOrders = useCallback(async () => {
        try {
            const [inKitchenData, preparingData, readyData] = await Promise.all(
                [
                    kitchenService.getOrders("IN_KITCHEN"),
                    kitchenService.getOrders("PREPARING"),
                    kitchenService.getOrders("READY"),
                ],
            );

            setInKitchenOrders(inKitchenData.orders || []);
            setPreparingOrders(preparingData.orders || []);
            setReadyOrders(readyData.orders || []);
        } catch (err) {
            console.error("Failed to fetch kitchen orders:", err);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const data = await kitchenService.getStats();
            setStats({
                inKitchen: data.inKitchen || 0,
                preparing: data.preparing || 0,
                ready: data.ready || 0,
                avgPrepTime: data.avgPrepTime || 0,
            });
        } catch (err) {
            console.error("Failed to fetch kitchen stats:", err);
        }
    }, []);

    const fetchAllData = useCallback(
        async (showRefreshing = false) => {
            try {
                if (showRefreshing) setRefreshing(true);
                else setLoading(true);

                await Promise.all([fetchOrders(), fetchStats()]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [fetchOrders, fetchStats],
    );

    // Initial load and auto-refresh (every 15 seconds for kitchen)
    useEffect(() => {
        fetchAllData();
        const interval = setInterval(() => fetchAllData(true), 15000);
        return () => clearInterval(interval);
    }, [fetchAllData]);

    // ==================== Status Update Handlers ====================

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setProcessingOrders((prev) => ({ ...prev, [orderId]: true }));
            await kitchenService.updateOrderStatus(orderId, newStatus);

            const statusMessages = {
                PREPARING: "Started preparing order",
                READY: "Order marked as ready",
                SERVED: "Order marked as served",
            };
            addSuccess(statusMessages[newStatus] || "Status updated");

            fetchAllData(true);
        } catch (err) {
            addError(err.response?.data?.message || "Failed to update status");
        } finally {
            setProcessingOrders((prev) => {
                const updated = { ...prev };
                delete updated[orderId];
                return updated;
            });
        }
    };

    // ==================== Utility Functions ====================

    const getTimeAgo = (dateString) => {
        if (!dateString) return "—";
        const created = new Date(dateString);
        const now = new Date();
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}h ${diffMins % 60}m`;
    };

    const getUrgencyClass = (dateString) => {
        if (!dateString) return "";
        const created = new Date(dateString);
        const now = new Date();
        const diffMins = Math.floor((now - created) / 60000);

        if (diffMins > 20) return "border-red-500 bg-red-50";
        if (diffMins > 10) return "border-amber-500 bg-amber-50";
        return "";
    };

    const formatPrepTime = (minutes) => {
        if (!minutes || minutes < 1) return "—";
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    // ==================== Loading State ====================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    // ==================== Order Card Component ====================

    const OrderCard = ({ order, nextStatus, nextLabel }) => {
        const isProcessing = processingOrders[order.orderId];
        const urgencyClass = getUrgencyClass(
            order.createdAt || order.sentToKitchenAt,
        );

        return (
            <div
                className={`bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${urgencyClass || "border-gray-200"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {order.tableNumber}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-800 text-sm">
                                {order.orderNumber}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(
                                    order.createdAt || order.sentToKitchenAt,
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-4">
                    {order.items?.map((item, idx) => {
                        return (
                            <div
                                key={idx}
                                className="flex items-start justify-between text-sm"
                            >
                                <div className="flex-1">
                                    <span className="font-medium text-gray-700">
                                        {item.quantity}× {item.menuItemName}
                                    </span>
                                    {/* Modifiers */}
                                    {item.selectedModifiers?.length > 0 && (
                                        <div className="text-xs text-gray-500 mt-0.5 pl-1">
                                            <span className="font-semibold">
                                                +{" "}
                                            </span>
                                            {item.selectedModifiers
                                                .map((m) =>
                                                    m.modifierName
                                                        ? `${m.modifierName}: ${m.optionName}`
                                                        : m.optionName,
                                                )
                                                .join(" • ")}
                                        </div>
                                    )}
                                    {item.specialInstructions && (
                                        <div className="text-xs text-amber-600 mt-0.5 italic pl-1">
                                            {item.specialInstructions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Special instructions */}
                {order.specialInstructions && (
                    <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg mb-4 text-xs text-amber-700">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{order.specialInstructions}</span>
                    </div>
                )}

                {/* Action button */}
                {nextStatus && (
                    <button
                        onClick={() =>
                            handleUpdateStatus(order.orderId, nextStatus)
                        }
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                {nextLabel}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    // ==================== Render ====================

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ChefHat className="w-8 h-8 text-primary-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Kitchen Display
                    </h1>
                </div>
                <button
                    onClick={() => fetchAllData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw
                        className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <UtensilsCrossed className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">
                                {stats.inKitchen}
                            </div>
                            <div className="text-sm text-gray-500">
                                In Kitchen
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                            <Flame className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">
                                {stats.preparing}
                            </div>
                            <div className="text-sm text-gray-500">
                                Preparing
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">
                                {stats.ready}
                            </div>
                            <div className="text-sm text-gray-500">Ready</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                            <Timer className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">
                                {formatPrepTime(stats.avgPrepTime)}
                            </div>
                            <div className="text-sm text-gray-500">
                                Avg Prep Time
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Columns */}
            <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
                {/* In Kitchen Column */}
                <div className="flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <h2 className="font-semibold text-gray-800">
                            In Kitchen
                        </h2>
                        <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {inKitchenOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {inKitchenOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <UtensilsCrossed className="w-12 h-12 mb-2" />
                                <span className="text-sm">
                                    No orders waiting
                                </span>
                            </div>
                        ) : (
                            inKitchenOrders.map((order) => (
                                <OrderCard
                                    key={order.orderId}
                                    order={order}
                                    nextStatus="PREPARING"
                                    nextLabel="Start Preparing"
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <h2 className="font-semibold text-gray-800">
                            Preparing
                        </h2>
                        <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            {preparingOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {preparingOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <Flame className="w-12 h-12 mb-2" />
                                <span className="text-sm">Nothing cooking</span>
                            </div>
                        ) : (
                            preparingOrders.map((order) => (
                                <OrderCard
                                    key={order.orderId}
                                    order={order}
                                    nextStatus="READY"
                                    nextLabel="Mark Ready"
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Ready Column */}
                <div className="flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <h2 className="font-semibold text-gray-800">
                            Ready to Serve
                        </h2>
                        <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {readyOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {readyOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <CheckCircle className="w-12 h-12 mb-2" />
                                <span className="text-sm">No orders ready</span>
                            </div>
                        ) : (
                            readyOrders.map((order) => (
                                <OrderCard
                                    key={order.orderId}
                                    order={order}
                                    /* KDS should not mark as served - that's the waiter's job */
                                    nextStatus={null}
                                    nextLabel={null}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KitchenDisplay;
