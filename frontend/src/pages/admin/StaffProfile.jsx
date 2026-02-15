import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import authService from "../../services/authService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
    User,
    Mail,
    Camera,
    Lock,
    Save,
    Shield,
    Calendar,
    Clock,
} from "lucide-react";

/**
 * StaffProfile - Staff/Admin profile management page
 */
function StaffProfile() {
    const { refreshStaffUser } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    // Profile data
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit mode
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ firstName: "", lastName: "" });
    const [saving, setSaving] = useState(false);

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);

    // Avatar upload
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await authService.getProfile();
            setProfile(data);
            setEditData({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
            });
        } catch {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEditToggle = () => {
        if (editing) {
            // Cancel - reset data
            setEditData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
            });
        }
        setEditing(!editing);
    };

    const handleSaveProfile = async () => {
        if (!editData.firstName.trim() || !editData.lastName.trim()) {
            toast.error("First name and last name are required");
            return;
        }

        setSaving(true);
        try {
            await authService.updateProfile(editData);
            await fetchProfile();
            await refreshStaffUser?.();
            setEditing(false);
            toast.success("Profile updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update profile",
            );
        } finally {
            setSaving(false);
        }
    };

    const validatePassword = () => {
        const errors = {};
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword) {
            errors.currentPassword = "Current password is required";
        }

        if (!newPassword) {
            errors.newPassword = "New password is required";
        } else if (newPassword.length < 8) {
            errors.newPassword = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(newPassword)) {
            errors.newPassword = "Password must contain an uppercase letter";
        } else if (!/[a-z]/.test(newPassword)) {
            errors.newPassword = "Password must contain a lowercase letter";
        } else if (!/[0-9]/.test(newPassword)) {
            errors.newPassword = "Password must contain a number";
        }

        if (newPassword !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setChangingPassword(true);
        try {
            await authService.updatePassword(passwordData);
            toast.success("Password changed successfully");
            setShowPasswordForm(false);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordErrors({});
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to change password",
            );
        } finally {
            setChangingPassword(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setUploadingAvatar(true);
        try {
            await authService.uploadAvatar(file);
            await fetchProfile();
            await refreshStaffUser?.();
            toast.success("Avatar updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to upload avatar",
            );
        } finally {
            setUploadingAvatar(false);
        }
    };

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case "ADMIN":
                return "purple";
            case "WAITER":
                return "info";
            case "KITCHEN_STAFF":
                return "warning";
            default:
                return "default";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Failed to load profile</p>
                <Button onClick={fetchProfile} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-500">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary-100">
                                        <User className="w-12 h-12 text-primary-500" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleAvatarClick}
                                disabled={uploadingAvatar}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors disabled:opacity-50"
                            >
                                {uploadingAvatar ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <Badge variant={getRoleBadgeVariant(profile.role)}>
                            {profile.role?.replace("_", " ")}
                        </Badge>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-4">
                        {editing ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        value={editData.firstName}
                                        onChange={(e) =>
                                            setEditData((prev) => ({
                                                ...prev,
                                                firstName: e.target.value,
                                            }))
                                        }
                                        placeholder="First name"
                                    />
                                    <Input
                                        label="Last Name"
                                        value={editData.lastName}
                                        onChange={(e) =>
                                            setEditData((prev) => ({
                                                ...prev,
                                                lastName: e.target.value,
                                            }))
                                        }
                                        placeholder="Last name"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSaveProfile}
                                        loading={saving}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleEditToggle}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {profile.firstName} {profile.lastName}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                                        <Mail className="w-4 h-4" />
                                        <span>{profile.email}</span>
                                        {profile.emailVerified && (
                                            <Badge variant="success" size="sm">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleEditToggle}
                                >
                                    Edit Profile
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Account Details */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-500" />
                    Account Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">
                                Member Since
                            </p>
                            <p className="font-medium text-gray-800">
                                {formatDate(profile.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Last Login</p>
                            <p className="font-medium text-gray-800">
                                {formatDateTime(profile.lastLogin)}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Security */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary-500" />
                    Security
                </h3>

                {showPasswordForm ? (
                    <form
                        onSubmit={handleChangePassword}
                        className="space-y-4 max-w-md"
                    >
                        <Input
                            label="Current Password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => {
                                setPasswordData((prev) => ({
                                    ...prev,
                                    currentPassword: e.target.value,
                                }));
                                if (passwordErrors.currentPassword) {
                                    setPasswordErrors((prev) => ({
                                        ...prev,
                                        currentPassword: undefined,
                                    }));
                                }
                            }}
                            error={passwordErrors.currentPassword}
                            placeholder="Enter current password"
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => {
                                setPasswordData((prev) => ({
                                    ...prev,
                                    newPassword: e.target.value,
                                }));
                                if (passwordErrors.newPassword) {
                                    setPasswordErrors((prev) => ({
                                        ...prev,
                                        newPassword: undefined,
                                    }));
                                }
                            }}
                            error={passwordErrors.newPassword}
                            placeholder="Enter new password"
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => {
                                setPasswordData((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                }));
                                if (passwordErrors.confirmPassword) {
                                    setPasswordErrors((prev) => ({
                                        ...prev,
                                        confirmPassword: undefined,
                                    }));
                                }
                            }}
                            error={passwordErrors.confirmPassword}
                            placeholder="Confirm new password"
                        />

                        {/* Password requirements */}
                        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-600">
                                Password requirements:
                            </p>
                            <ul className="grid grid-cols-2 gap-1">
                                <li
                                    className={
                                        passwordData.newPassword.length >= 8
                                            ? "text-green-600"
                                            : ""
                                    }
                                >
                                    • At least 8 characters
                                </li>
                                <li
                                    className={
                                        /[A-Z]/.test(passwordData.newPassword)
                                            ? "text-green-600"
                                            : ""
                                    }
                                >
                                    • One uppercase letter
                                </li>
                                <li
                                    className={
                                        /[a-z]/.test(passwordData.newPassword)
                                            ? "text-green-600"
                                            : ""
                                    }
                                >
                                    • One lowercase letter
                                </li>
                                <li
                                    className={
                                        /[0-9]/.test(passwordData.newPassword)
                                            ? "text-green-600"
                                            : ""
                                    }
                                >
                                    • One number
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" loading={changingPassword}>
                                Change Password
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordData({
                                        currentPassword: "",
                                        newPassword: "",
                                        confirmPassword: "",
                                    });
                                    setPasswordErrors({});
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-800 font-medium">
                                Password
                            </p>
                            <p className="text-sm text-gray-500">
                                Last changed: {formatDate(profile.updatedAt)}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordForm(true)}
                        >
                            Change Password
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default StaffProfile;
