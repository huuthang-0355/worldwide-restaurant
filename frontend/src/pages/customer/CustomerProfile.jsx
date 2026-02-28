import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import authService from "../../services/authService";
import { formatPrice } from "../../utils/formatCurrency";
import {
    ArrowLeft,
    User,
    Camera,
    Lock,
    ClipboardList,
    Loader2,
    Eye,
    EyeOff,
    Package,
    Calendar,
    LogOut,
} from "lucide-react";

/**
 * CustomerProfile - Profile page for logged-in customers
 *
 * Features:
 *  - View/edit name
 *  - Upload avatar
 *  - Change password
 *  - View order history
 */
function CustomerProfile() {
    const navigate = useNavigate();
    const { addSuccess, addError } = useToast();
    const { customerUser, refreshCustomerUser, customerLogout } = useAuth();

    const [activeTab, setActiveTab] = useState("profile");

    // Profile state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Order history state
    const [orderHistory, setOrderHistory] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Load profile data on mount
    useEffect(() => {
        if (customerUser) {
            setFirstName(customerUser.firstName || "");
            setLastName(customerUser.lastName || "");
            setAvatarPreview(customerUser.avatar || null);
        }
    }, [customerUser]);

    const fetchOrderHistory = useCallback(async () => {
        try {
            setLoadingHistory(true);
            const data = await authService.getOrderHistory();
            setOrderHistory(data);
        } catch (err) {
            addError(
                err.response?.data?.message || "Failed to load order history",
            );
        } finally {
            setLoadingHistory(false);
        }
    }, [addError]);

    // Fetch order history when tab changes
    useEffect(() => {
        if (activeTab === "history" && !orderHistory) {
            fetchOrderHistory();
        }
    }, [activeTab, orderHistory, fetchOrderHistory]);

    // ==================== Profile Handlers ====================

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addError("Image must be less than 5MB");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        // Validation
        if (firstName.trim().length < 2 || firstName.trim().length > 50) {
            addError("First name must be between 2 and 50 characters");
            return;
        }
        if (lastName.trim().length < 2 || lastName.trim().length > 50) {
            addError("Last name must be between 2 and 50 characters");
            return;
        }

        try {
            setSavingProfile(true);

            // Upload avatar if changed
            if (avatarFile) {
                await authService.uploadAvatar(avatarFile);
                setAvatarFile(null);
            }

            // Update profile
            await authService.updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });

            await refreshCustomerUser();
            addSuccess("Profile updated successfully");
        } catch (err) {
            addError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    // ==================== Password Handlers ====================

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword) {
            addError("Current password is required");
            return;
        }
        if (newPassword.length < 8) {
            addError("New password must be at least 8 characters");
            return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            addError("Password must contain uppercase, lowercase, and number");
            return;
        }
        if (newPassword !== confirmPassword) {
            addError("Passwords do not match");
            return;
        }

        try {
            setSavingPassword(true);
            await authService.updatePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            addSuccess("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            addError(
                err.response?.data?.message || "Failed to change password",
            );
        } finally {
            setSavingPassword(false);
        }
    };

    // ==================== Logout Handler ====================

    const handleLogout = () => {
        customerLogout();
        navigate("/menu/browse");
    };

    // ==================== Utility ====================

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: "bg-yellow-100 text-yellow-700",
            ACCEPTED: "bg-blue-100 text-blue-700",
            IN_KITCHEN: "bg-blue-100 text-blue-700",
            PREPARING: "bg-orange-100 text-orange-700",
            READY: "bg-green-100 text-green-700",
            SERVED: "bg-gray-100 text-gray-700",
            COMPLETED: "bg-gray-100 text-gray-600",
            CANCELLED: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    // ==================== Not Logged In ====================

    if (!customerUser) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <User className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Not Logged In
                </h2>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                    Log in to view your profile and order history.
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition-colors"
                >
                    Log In
                </button>
            </div>
        );
    }

    // ==================== Render ====================

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                <button
                    onClick={() => navigate("/menu/browse")}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-gray-800">My Profile</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "password", label: "Password", icon: Lock },
                    { id: "history", label: "History", icon: ClipboardList },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === id
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="px-4 py-6">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {customerUser.email}
                            </p>
                        </div>

                        {/* Name Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                            {savingProfile ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Save Changes"
                            )}
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword,
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewPassword(!showNewPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Min 8 characters, with uppercase, lowercase &
                                number
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                            />
                        </div>

                        <button
                            onClick={handleChangePassword}
                            disabled={savingPassword}
                            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                            {savingPassword ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Change Password"
                            )}
                        </button>
                    </div>
                )}

                {/* Order History Tab */}
                {activeTab === "history" && (
                    <div>
                        {loadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
                                <p className="text-gray-500 text-sm">
                                    Loading order history...
                                </p>
                            </div>
                        ) : orderHistory?.orders?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No Orders Yet
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Your order history will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Summary */}
                                {orderHistory && (
                                    <div className="bg-primary-50 rounded-xl p-4 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Total Sessions
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {orderHistory.totalSessions}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-2">
                                            <span className="text-gray-600">
                                                Total Orders
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {orderHistory.totalOrders}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Orders List */}
                                {orderHistory?.orders?.map((order) => (
                                    <div
                                        key={order.orderId}
                                        className="bg-white border border-gray-200 rounded-xl p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="font-semibold text-gray-800">
                                                    {order.orderNumber}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(
                                                        order.createdAt,
                                                    )}
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-2 border-t border-gray-100 pt-3">
                                            {order.items
                                                ?.slice(0, 3)
                                                .map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between text-sm"
                                                    >
                                                        <span className="text-gray-600">
                                                            {item.quantity}×{" "}
                                                            {item.menuItemName}
                                                        </span>
                                                        <span className="text-gray-800">
                                                            {formatPrice(
                                                                item.lineTotal,
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            {order.items?.length > 3 && (
                                                <p className="text-xs text-gray-400">
                                                    +{order.items.length - 3}{" "}
                                                    more items
                                                </p>
                                            )}
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                                            <span className="text-sm text-gray-500">
                                                Total
                                            </span>
                                            <span className="font-bold text-gray-800">
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerProfile;
