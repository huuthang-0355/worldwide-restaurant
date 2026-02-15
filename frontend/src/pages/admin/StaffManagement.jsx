import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, UserX, UserCheck } from "lucide-react";
import { useToast } from "../../context/useToast";
import authService from "../../services/authService";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import IconButton from "../../components/ui/IconButton";
import Select from "../../components/ui/Select";

/**
 * StaffManagement - CRUD page for staff members (Admin only)
 */
function StaffManagement() {
    const toast = useToast();

    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "WAITER",
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch staff
    const fetchStaff = useCallback(async () => {
        try {
            setLoading(true);
            const data = await authService.getAllStaff();
            // API returns { success, message, staff: [], total }
            const staffArray = Array.isArray(data)
                ? data
                : data?.staff || data?.data || [];
            setStaff(staffArray);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load staff");
            setStaff([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // Filter staff
    const filteredStaff = Array.isArray(staff)
        ? staff.filter((member) => {
              const matchesSearch =
                  member.firstName
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  member.lastName
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  member.email
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase());
              const matchesRole =
                  roleFilter === "all" || member.role === roleFilter;
              const matchesStatus =
                  statusFilter === "all" || member.status === statusFilter;
              return matchesSearch && matchesRole && matchesStatus;
          })
        : [];

    // Form validation
    const validateForm = () => {
        const errors = {};

        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email";
        }

        // Password required only for new staff
        if (!selectedStaff && !formData.password) {
            errors.password = "Password is required";
        } else if (!selectedStaff && formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        if (!formData.role) {
            errors.role = "Role is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form change
    const handleChange = (field) => (e) => {
        const value = e.target?.value ?? e;
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Open create form
    const openCreateForm = () => {
        setSelectedStaff(null);
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "WAITER",
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    // Open edit form
    const openEditForm = (member) => {
        setSelectedStaff(member);
        setFormData({
            firstName: member.firstName || "",
            lastName: member.lastName || "",
            email: member.email || "",
            password: "",
            role: member.role || "WAITER",
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    // Close form
    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedStaff(null);
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "WAITER",
        });
        setFormErrors({});
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = { ...formData };
            // Remove empty password for updates
            if (selectedStaff && !payload.password) {
                delete payload.password;
            }

            if (selectedStaff) {
                await authService.updateStaff(selectedStaff.id, payload);
                toast.success("Staff member updated successfully");
            } else {
                await authService.createStaff(payload);
                toast.success("Staff member created successfully");
            }

            closeForm();
            fetchStaff();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    `Failed to ${selectedStaff ? "update" : "create"} staff member`,
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle status
    const handleToggleStatus = async (member) => {
        const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        try {
            await authService.updateStaffStatus(member.id, newStatus);
            toast.success(
                `Staff ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`,
            );
            fetchStaff();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update status",
            );
        }
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "Never";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Role badge colors
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "ADMIN":
                return "bg-purple-100 text-purple-700";
            case "WAITER":
                return "bg-blue-100 text-blue-700";
            case "KITCHEN_STAFF":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Status badge colors
    const getStatusBadgeColor = (status) => {
        return status === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";
    };

    // Role options
    const roleOptions = [
        { value: "ADMIN", label: "Admin" },
        { value: "WAITER", label: "Waiter" },
        { value: "KITCHEN_STAFF", label: "Kitchen Staff" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="large" text="Loading staff..." />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Staff Management"
                subtitle="Manage restaurant staff members"
                action={
                    <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={openCreateForm}
                    >
                        Add Staff
                    </Button>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="WAITER">Waiter</option>
                    <option value="KITCHEN_STAFF">Kitchen Staff</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>

            {/* Staff Table */}
            {filteredStaff.length === 0 ? (
                <EmptyState
                    title={
                        searchTerm ? "No staff found" : "No staff members yet"
                    }
                    description={
                        searchTerm
                            ? "Try adjusting your search or filters"
                            : "Add your first staff member to get started"
                    }
                    action={
                        !searchTerm && (
                            <Button
                                icon={<Plus className="w-4 h-4" />}
                                onClick={openCreateForm}
                            >
                                Add Staff
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStaff.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                                                    {member.firstName?.[0]}
                                                    {member.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {member.firstName}{" "}
                                                        {member.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {member.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                                                    member.role,
                                                )}`}
                                            >
                                                {member.role?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                                    member.status,
                                                )}`}
                                            >
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {formatDate(member.lastLogin)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <IconButton
                                                    icon={
                                                        <Edit2 className="w-4 h-4" />
                                                    }
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEditForm(member)
                                                    }
                                                    title="Edit"
                                                />
                                                <IconButton
                                                    icon={
                                                        member.status ===
                                                        "ACTIVE" ? (
                                                            <UserX className="w-4 h-4" />
                                                        ) : (
                                                            <UserCheck className="w-4 h-4" />
                                                        )
                                                    }
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            member,
                                                        )
                                                    }
                                                    title={
                                                        member.status ===
                                                        "ACTIVE"
                                                            ? "Deactivate"
                                                            : "Activate"
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Staff Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={selectedStaff ? "Edit Staff Member" : "Add Staff Member"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange("firstName")}
                            error={formErrors.firstName}
                            placeholder="John"
                        />
                        <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={handleChange("lastName")}
                            error={formErrors.lastName}
                            placeholder="Doe"
                        />
                    </div>

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        error={formErrors.email}
                        placeholder="john@restaurant.com"
                    />

                    <Input
                        label={
                            selectedStaff
                                ? "New Password (leave blank to keep)"
                                : "Password"
                        }
                        type="password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        error={formErrors.password}
                        placeholder={
                            selectedStaff ? "••••••••" : "Enter password"
                        }
                    />

                    <Select
                        label="Role"
                        value={formData.role}
                        onChange={handleChange("role")}
                        options={roleOptions}
                        error={formErrors.role}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={closeForm}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {selectedStaff ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default StaffManagement;
