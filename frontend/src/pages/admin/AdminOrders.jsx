import { useState, useEffect, useCallback } from "react";
import {
    ClipboardList,
    Receipt,
    ChefHat,
    Check,
    X,
    Send,
    RefreshCw,
    Clock,
    AlertCircle,
    Loader2,
    ChevronDown,
    ChevronUp,
    Users,
    CreditCard,
    CheckCircle,
    UtensilsCrossed,
    XCircle,
} from "lucide-react";
import { formatPrice } from "../../utils/formatCurrency";
import { useToast } from "../../context/useToast";
import waiterService from "../../services/waiterService";

/**
 * AdminOrders - Combined order management page with tabs
 *
 * Tabs:
 *  1. New Orders - PENDING status, needs review/accept/reject
 *  2. Accepted - ACCEPTED status, ready to send to kitchen
 *  3. In Kitchen - IN_KITCHEN/PREPARING status, being cooked
 *  4. Ready - READY status, waiting for delivery
 *  5. Bill Requests - Tables requesting their bill
 */
function AdminOrders() {
    const { addSuccess, addError } = useToast();
    const [activeTab, setActiveTab] = useState("new");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Orders by status
    const [newOrders, setNewOrders] = useState([]);
    const [acceptedOrders, setAcceptedOrders] = useState([]);
    const [inKitchenOrders, setInKitchenOrders] = useState([]);
    const [readyOrders, setReadyOrders] = useState([]);
    const [expandedOrders, setExpandedOrders] = useState({});
    const [processingItems, setProcessingItems] = useState({});
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processingServed, setProcessingServed] = useState({});

    // Bill requests state
    const [billRequests, setBillRequests] = useState([]);

    // Rejected orders state
    const [rejectedOrders, setRejectedOrders] = useState([]);

    // Tab configuration
    const tabs = [
        {
            id: "new",
            label: "New Orders",
            icon: ClipboardList,
            count: newOrders.length,
        },
        {
            id: "accepted",
            label: "Accepted",
            icon: CheckCircle,
            count: acceptedOrders.length,
        },
        {
            id: "kitchen",
            label: "In Kitchen",
            icon: ChefHat,
            count: inKitchenOrders.length,
        },
        {
            id: "ready",
            label: "Ready",
            icon: UtensilsCrossed,
            count: readyOrders.length,
        },
        {
            id: "bills",
            label: "Bill Requests",
            icon: Receipt,
            count: billRequests.length,
        },
        {
            id: "rejected",
            label: "Rejected",
            icon: XCircle,
            count: rejectedOrders.length,
        },
    ];

    // ==================== Data Fetching ====================

    const fetchNewOrders = useCallback(async () => {
        try {
            const data = await waiterService.getAllOrders({
                status: "PENDING",
            });
            setNewOrders(data.orders || []);
            // Auto-expand on first load
            if (
                data.orders?.length > 0 &&
                Object.keys(expandedOrders).length === 0
            ) {
                const expanded = {};
                data.orders.forEach((order) => {
                    expanded[order.orderId] = true;
                });
                setExpandedOrders(expanded);
            }
        } catch (err) {
            console.error("Failed to fetch pending orders:", err);
        }
    }, [expandedOrders]);

    const fetchAcceptedOrders = useCallback(async () => {
        try {
            const data = await waiterService.getAllOrders({
                status: "ACCEPTED",
            });
            setAcceptedOrders(data.orders || []);
        } catch (err) {
            console.error("Failed to fetch accepted orders:", err);
        }
    }, []);

    const fetchInKitchenOrders = useCallback(async () => {
        try {
            const [inKitchen, preparing] = await Promise.all([
                waiterService.getAllOrders({ status: "IN_KITCHEN" }),
                waiterService.getAllOrders({ status: "PREPARING" }),
            ]);
            const combined = [
                ...(inKitchen.orders || []),
                ...(preparing.orders || []),
            ];
            setInKitchenOrders(combined);
        } catch (err) {
            console.error("Failed to fetch in-kitchen orders:", err);
        }
    }, []);

    const fetchReadyOrders = useCallback(async () => {
        try {
            const data = await waiterService.getAllOrders({ status: "READY" });
            setReadyOrders(data.orders || []);
        } catch (err) {
            console.error("Failed to fetch ready orders:", err);
        }
    }, []);

    const fetchBillRequests = useCallback(async () => {
        try {
            const data = await waiterService.getBillRequests();
            setBillRequests(data.requests || []);
        } catch (err) {
            console.error("Failed to fetch bill requests:", err);
        }
    }, []);

    const fetchRejectedOrders = useCallback(async () => {
        try {
            const data = await waiterService.getAllOrders({
                status: "CANCELLED",
            });
            setRejectedOrders(data.orders || []);
        } catch (err) {
            console.error("Failed to fetch rejected orders:", err);
        }
    }, []);

    const fetchAllData = useCallback(
        async (showRefreshing = false) => {
            try {
                if (showRefreshing) setRefreshing(true);
                else setLoading(true);

                await Promise.all([
                    fetchNewOrders(),
                    fetchAcceptedOrders(),
                    fetchInKitchenOrders(),
                    fetchReadyOrders(),
                    fetchBillRequests(),
                    fetchRejectedOrders(),
                ]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            fetchNewOrders,
            fetchAcceptedOrders,
            fetchInKitchenOrders,
            fetchReadyOrders,
            fetchBillRequests,
            fetchRejectedOrders,
        ],
    );

    // Initial load and auto-refresh
    useEffect(() => {
        fetchAllData();
        const interval = setInterval(() => fetchAllData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchAllData]);

    // ==================== Pending Orders Handlers ====================

    const toggleOrder = (orderId) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    const handleAcceptItem = async (orderId, itemId) => {
        const key = `${orderId}-${itemId}`;
        try {
            setProcessingItems((prev) => ({ ...prev, [key]: "accepting" }));
            await waiterService.acceptItem(orderId, itemId);
            addSuccess("Item accepted");
            fetchNewOrders();
            fetchAcceptedOrders();
        } catch (err) {
            addError(err.response?.data?.message || "Failed to accept item");
        } finally {
            setProcessingItems((prev) => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
        }
    };

    const openRejectModal = (orderId, itemId, itemName) => {
        setRejectModal({ orderId, itemId, itemName });
        setRejectReason("");
    };

    const handleRejectItem = async () => {
        if (!rejectModal || !rejectReason.trim()) {
            addError("Please provide a rejection reason");
            return;
        }

        const { orderId, itemId } = rejectModal;
        const key = `${orderId}-${itemId}`;

        try {
            setProcessingItems((prev) => ({ ...prev, [key]: "rejecting" }));
            await waiterService.rejectItem(
                orderId,
                itemId,
                rejectReason.trim(),
            );
            addSuccess("Item rejected");
            setRejectModal(null);
            fetchNewOrders();
            fetchAcceptedOrders();
        } catch (err) {
            addError(err.response?.data?.message || "Failed to reject item");
        } finally {
            setProcessingItems((prev) => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
        }
    };

    const handleSendToKitchen = async (orderId) => {
        try {
            setProcessingItems((prev) => ({ ...prev, [orderId]: "sending" }));
            await waiterService.sendToKitchen(orderId);
            addSuccess("Order sent to kitchen");
            fetchNewOrders();
            fetchAcceptedOrders();
            fetchInKitchenOrders();
        } catch (err) {
            addError(
                err.response?.data?.message || "Failed to send to kitchen",
            );
        } finally {
            setProcessingItems((prev) => {
                const updated = { ...prev };
                delete updated[orderId];
                return updated;
            });
        }
    };

    // ==================== Ready Orders Handlers ====================

    const handleMarkServed = async (orderId) => {
        try {
            setProcessingServed((prev) => ({ ...prev, [orderId]: true }));
            await waiterService.markServed(orderId);
            addSuccess("Order marked as served");
            fetchReadyOrders();
        } catch (err) {
            addError(err.response?.data?.message || "Failed to mark as served");
        } finally {
            setProcessingServed((prev) => {
                const updated = { ...prev };
                delete updated[orderId];
                return updated;
            });
        }
    };

    // ==================== Utility Functions ====================

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-700",
            ACCEPTED: "bg-green-100 text-green-700",
            REJECTED: "bg-red-100 text-red-700",
            BILL_REQUESTED: "bg-amber-100 text-amber-700",
            PAYMENT_PENDING: "bg-blue-100 text-blue-700",
            PAID: "bg-green-100 text-green-700",
        };
        return (
            <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}
            >
                {status?.replace(/_/g, " ")}
            </span>
        );
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return "—";
        const created = new Date(dateString);
        const now = new Date();
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}h ${diffMins % 60}m ago`;
    };

    const getSessionDuration = (startedAt) => {
        if (!startedAt) return "—";
        const started = new Date(startedAt);
        const now = new Date();
        const diffMs = now - started;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    // ==================== Loading State ====================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    // ==================== Render ====================

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Order Management
                </h1>
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

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                                isActive
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {tab.label}
                            {tab.count > 0 && (
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        isActive
                                            ? "bg-primary-100 text-primary-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ==================== New Orders Tab ==================== */}
            {activeTab === "new" && (
                <div className="space-y-4">
                    {newOrders.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No New Orders
                            </h3>
                            <p className="text-gray-500">
                                All orders have been reviewed.
                            </p>
                        </div>
                    ) : (
                        newOrders.map((order) => (
                            <div
                                key={order.orderId}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                            >
                                {/* Order header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleOrder(order.orderId)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                            {order.tableNumber}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {order.orderNumber}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {getTimeAgo(order.createdAt)}
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                {order.items?.length || 0} items
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-700">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                        {expandedOrders[order.orderId] ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Order items (expanded) */}
                                {expandedOrders[order.orderId] && (
                                    <div className="border-t border-gray-100">
                                        {/* Special instructions */}
                                        {order.specialInstructions && (
                                            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                                                <div className="flex items-start gap-2 text-amber-700 text-sm">
                                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <span>
                                                        {
                                                            order.specialInstructions
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Items list */}
                                        <div className="divide-y divide-gray-100">
                                            {order.items?.map((item) => {
                                                const key = `${order.orderId}-${item.id}`;
                                                const isProcessing =
                                                    processingItems[key];

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-4"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-800">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    ×{" "}
                                                                    {
                                                                        item.menuItemName
                                                                    }
                                                                </span>
                                                                {getStatusBadge(
                                                                    item.status,
                                                                )}
                                                            </div>
                                                            {item
                                                                .selectedModifiers
                                                                ?.length >
                                                                0 && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    <span className="font-semibold">
                                                                        +{" "}
                                                                    </span>
                                                                    {item.selectedModifiers
                                                                        .map(
                                                                            (
                                                                                m,
                                                                            ) =>
                                                                                m.modifierName
                                                                                    ? `${m.modifierName}: ${m.optionName}`
                                                                                    : m.optionName,
                                                                        )
                                                                        .join(
                                                                            " • ",
                                                                        )}
                                                                </p>
                                                            )}
                                                            {item.specialInstructions && (
                                                                <p className="text-sm text-amber-600 mt-1 italic">
                                                                    {
                                                                        item.specialInstructions
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-gray-700">
                                                                {formatPrice(
                                                                    item.lineTotal ||
                                                                        item.totalPrice ||
                                                                        item.subtotal ||
                                                                        0,
                                                                )}
                                                            </span>

                                                            {/* Action buttons for PENDING items */}
                                                            {item.status ===
                                                                "PENDING" && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleAcceptItem(
                                                                                order.orderId,
                                                                                item.id,
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            isProcessing
                                                                        }
                                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                                        title="Accept"
                                                                    >
                                                                        {isProcessing ===
                                                                        "accepting" ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <Check className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            openRejectModal(
                                                                                order.orderId,
                                                                                item.id,
                                                                                item.menuItemName,
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            isProcessing
                                                                        }
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                                        title="Reject"
                                                                    >
                                                                        {isProcessing ===
                                                                        "rejecting" ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <X className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ==================== Accepted Orders Tab ==================== */}
            {activeTab === "accepted" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {acceptedOrders.length === 0 ? (
                        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No Accepted Orders
                            </h3>
                            <p className="text-gray-500">
                                Accepted orders will appear here. Send them to
                                kitchen when ready.
                            </p>
                        </div>
                    ) : (
                        acceptedOrders.map((order) => (
                            <div
                                key={order.orderId}
                                className="bg-white rounded-xl border-2 border-green-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                                            {order.tableNumber}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {order.orderNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.items?.length || 0} items
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        ACCEPTED
                                    </span>
                                </div>
                                <div className="space-y-3 mb-4">
                                    {order.items?.map((item, idx) => {
                                        return (
                                            <div key={idx} className="text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700 font-medium">
                                                        {item.quantity}×{" "}
                                                        {item.menuItemName}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatPrice(
                                                            item.lineTotal || 0,
                                                        )}
                                                    </span>
                                                </div>
                                                {item.selectedModifiers
                                                    ?.length > 0 && (
                                                    <div className="text-xs text-gray-500 mt-1 ml-4">
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
                                                    <div className="text-xs text-amber-600 mt-1 ml-4 italic">
                                                        {
                                                            item.specialInstructions
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-4">
                                    <span className="font-semibold text-gray-700">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-gray-800">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>

                                {/* Send to Kitchen button */}
                                <button
                                    onClick={() =>
                                        handleSendToKitchen(order.orderId)
                                    }
                                    disabled={
                                        processingItems[order.orderId] ===
                                        "sending"
                                    }
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingItems[order.orderId] ===
                                    "sending" ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send to Kitchen
                                        </>
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ==================== In Kitchen Tab ==================== */}
            {activeTab === "kitchen" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {inKitchenOrders.length === 0 ? (
                        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No Orders in Kitchen
                            </h3>
                            <p className="text-gray-500">
                                Orders currently being prepared will appear
                                here.
                            </p>
                        </div>
                    ) : (
                        inKitchenOrders.map((order) => (
                            <div
                                key={order.orderId}
                                className="bg-white rounded-xl border-2 border-amber-200 p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">
                                            {order.tableNumber}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {order.orderNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.items?.length || 0} items
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            order.status === "PREPARING"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="space-y-3 mb-4">
                                    {order.items?.map((item, idx) => {
                                        return (
                                            <div key={idx} className="text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700 font-medium">
                                                        {item.quantity}×{" "}
                                                        {item.menuItemName}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatPrice(
                                                            item.lineTotal || 0,
                                                        )}
                                                    </span>
                                                </div>
                                                {item.selectedModifiers
                                                    ?.length > 0 && (
                                                    <div className="text-xs text-gray-500 mt-1 ml-4">
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
                                                    <div className="text-xs text-amber-600 mt-1 ml-4 italic">
                                                        {
                                                            item.specialInstructions
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="font-semibold text-gray-700">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-gray-800">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ==================== Ready to Serve Tab ==================== */}
            {activeTab === "ready" && (
                <div>
                    {readyOrders.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No Orders Ready
                            </h3>
                            <p className="text-gray-500">
                                Kitchen is still preparing orders.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {readyOrders.map((order) => (
                                <div
                                    key={order.orderId}
                                    className="bg-white rounded-xl border-2 border-green-200 p-5 hover:shadow-md transition-shadow"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                                                {order.tableNumber}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {order.orderNumber}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-green-600">
                                                    <Clock className="w-4 h-4" />
                                                    Ready{" "}
                                                    {getTimeAgo(order.readyAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            READY
                                        </span>
                                    </div>

                                    {/* Items preview */}
                                    <div className="space-y-3 mb-4">
                                        {order.items
                                            ?.slice(0, 3)
                                            .map((item, idx) => {
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="text-sm"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700 font-medium">
                                                                {item.quantity}×{" "}
                                                                {
                                                                    item.menuItemName
                                                                }
                                                            </span>
                                                        </div>
                                                        {item.selectedModifiers
                                                            ?.length > 0 && (
                                                            <div className="text-xs text-gray-500 mt-1 ml-4">
                                                                <span className="font-semibold">
                                                                    +{" "}
                                                                </span>
                                                                {item.selectedModifiers
                                                                    .map((m) =>
                                                                        m.modifierName
                                                                            ? `${m.modifierName}: ${m.optionName}`
                                                                            : m.optionName,
                                                                    )
                                                                    .join(
                                                                        " • ",
                                                                    )}
                                                            </div>
                                                        )}
                                                        {item.specialInstructions && (
                                                            <div className="text-xs text-amber-600 mt-1 ml-4 italic">
                                                                {
                                                                    item.specialInstructions
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        {order.items?.length > 3 && (
                                            <div className="text-sm text-gray-500">
                                                +{order.items.length - 3} more
                                                items
                                            </div>
                                        )}
                                    </div>

                                    {/* Mark Served button */}
                                    <button
                                        onClick={() =>
                                            handleMarkServed(order.orderId)
                                        }
                                        disabled={
                                            processingServed[order.orderId]
                                        }
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                                    >
                                        {processingServed[order.orderId] ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Marking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Mark as Served
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ==================== Bill Requests Tab ==================== */}
            {activeTab === "bills" && (
                <div>
                    {billRequests.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No Bill Requests
                            </h3>
                            <p className="text-gray-500">
                                No tables have requested their bill yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4">
                                {billRequests.map((request) => (
                                    <div
                                        key={request.sessionId}
                                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            {/* Table info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                                                    <span className="text-xl font-bold">
                                                        {request.tableNumber}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-800">
                                                            Table{" "}
                                                            {
                                                                request.tableNumber
                                                            }
                                                        </h3>
                                                        {getStatusBadge(
                                                            request.status,
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {request.guestCount}{" "}
                                                            guests
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {getSessionDuration(
                                                                request.startedAt,
                                                            )}
                                                        </div>
                                                        <div>
                                                            {request.orderCount}{" "}
                                                            order
                                                            {request.orderCount !==
                                                            1
                                                                ? "s"
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total and action */}
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-800 mb-1">
                                                    {formatPrice(
                                                        request.estimatedTotal,
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mb-3">
                                                    Requested{" "}
                                                    {getTimeAgo(
                                                        request.billRequestedAt,
                                                    )}
                                                </div>
                                                <button
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                                                    onClick={() => {
                                                        // TODO: Navigate to payment processing
                                                        addSuccess(
                                                            "Payment processing coming soon",
                                                        );
                                                    }}
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Process Payment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <strong>{billRequests.length}</strong>{" "}
                                        table
                                        {billRequests.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                        waiting for bill
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Total pending:{" "}
                                        <strong className="text-gray-800">
                                            {formatPrice(
                                                billRequests.reduce(
                                                    (sum, r) =>
                                                        sum +
                                                        (r.estimatedTotal || 0),
                                                    0,
                                                ),
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ==================== Rejected Tab ==================== */}
            {activeTab === "rejected" && (
                <div>
                    {rejectedOrders.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                No Rejected Orders
                            </h3>
                            <p className="text-gray-500">
                                Orders where all items were rejected will appear
                                here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {rejectedOrders.map((order) => (
                                <div
                                    key={order.orderId}
                                    className="bg-white rounded-xl border-2 border-red-200 p-5"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold">
                                                {order.tableNumber}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {order.orderNumber}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    {getTimeAgo(
                                                        order.createdAt,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                            CANCELLED
                                        </span>
                                    </div>

                                    {/* Items list */}
                                    <div className="space-y-3">
                                        {order.items?.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="text-sm border-l-2 border-red-200 pl-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700 font-medium">
                                                        {item.quantity}×{" "}
                                                        {item.menuItemName}
                                                    </span>
                                                    {getStatusBadge(
                                                        item.status,
                                                    )}
                                                </div>
                                                {item.selectedModifiers
                                                    ?.length > 0 && (
                                                    <div className="text-xs text-gray-500 mt-1">
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
                                                {item.rejectionReason && (
                                                    <div className="text-xs text-red-600 mt-1 italic">
                                                        Reason:{" "}
                                                        {item.rejectionReason}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ==================== Reject Modal ==================== */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            Reject Item
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Provide a reason for rejecting{" "}
                            <strong>{rejectModal.itemName}</strong>
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Out of stock, Ingredient unavailable..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setRejectModal(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectItem}
                                disabled={!rejectReason.trim()}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                Reject Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
