import { useState, useEffect, useCallback } from "react";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    RefreshCw,
    Loader2,
    Calendar,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { formatPrice } from "../../utils/formatCurrency";
import { useToast } from "../../context/useToast";
import reportService from "../../services/reportService";

/**
 * Reports - Sales and analytics dashboard
 *
 * Features:
 *  - Revenue summary cards
 *  - Period filters
 *  - Charts (placeholder for future)
 */
function Reports() {
    const { addError } = useToast();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState("7days");

    // Report data
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalCustomers: 0,
        revenueChange: 0,
        ordersChange: 0,
    });
    const [topItems, setTopItems] = useState([]);

    // Period options
    const periods = [
        { value: "today", label: "Today" },
        { value: "7days", label: "Last 7 Days" },
        { value: "30days", label: "Last 30 Days" },
        { value: "90days", label: "Last 90 Days" },
    ];

    // ==================== Data Fetching ====================

    const fetchData = useCallback(
        async (showRefreshing = false) => {
            try {
                if (showRefreshing) setRefreshing(true);
                else setLoading(true);

                const [revenueData, topItemsData] = await Promise.all([
                    reportService.getRevenueReport({ period }),
                    reportService.getTopItemsReport({ period, limit: 5 }),
                ]);

                if (revenueData?.data) {
                    setSummary({
                        totalRevenue: revenueData.data.totalRevenue || 0,
                        totalOrders: revenueData.data.totalOrders || 0,
                        avgOrderValue: revenueData.data.avgOrderValue || 0,
                        totalCustomers: revenueData.data.totalCustomers || 0,
                        revenueChange: revenueData.data.revenueChange || 0,
                        ordersChange: revenueData.data.ordersChange || 0,
                    });
                }

                if (topItemsData?.data?.items) {
                    setTopItems(topItemsData.data.items);
                }
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                addError("Failed to load report data");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [period, addError],
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ==================== Utility Functions ====================

    const formatChange = (value) => {
        if (!value || value === 0) return null;
        const isPositive = value > 0;
        return (
            <span
                className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
                {isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                ) : (
                    <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(value).toFixed(1)}%
            </span>
        );
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
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-primary-500" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Reports
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* Period Filter */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                        {periods.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    period === p.value
                                        ? "bg-primary-500 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        {formatChange(summary.revenueChange)}
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {formatPrice(summary.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        {formatChange(summary.ordersChange)}
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {summary.totalOrders}
                    </div>
                    <div className="text-sm text-gray-500">Total Orders</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {formatPrice(summary.avgOrderValue)}
                    </div>
                    <div className="text-sm text-gray-500">Avg Order Value</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {summary.totalCustomers}
                    </div>
                    <div className="text-sm text-gray-500">Customers</div>
                </div>
            </div>

            {/* Top Selling Items */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">
                        Top Selling Items
                    </h2>
                </div>
                <div className="p-5">
                    {topItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No data available for this period
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topItems.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <div className="font-medium text-gray-800">
                                                {item.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.category}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-800">
                                            {item.quantity} sold
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatPrice(item.revenue)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                    <Calendar className="w-16 h-16 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Revenue Chart
                    </h3>
                    <p className="text-sm text-gray-500">
                        Charts will be displayed here
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Reports;
