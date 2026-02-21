import { useState, useEffect } from "react";
import menuService from "../../services/menuService";
import { useToast } from "../../context/useToast";
import MenuCard from "../../components/admin/MenuCard";
import MenuItemEditor from "../../components/admin/MenuItemEditor";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { MENU_STATUS } from "../../constants/menuStatus";

/**
 * MenuManagement - Main page for managing menu items
 */
function MenuManagement() {
    const toast = useToast();
    // State management
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch menu items and categories in parallel
            const [itemsData, categoriesData] = await Promise.all([
                menuService.getAllMenuItems(),
                menuService.getAllCategories(),
            ]);

            setMenuItems(itemsData);
            setCategories(categoriesData);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load menu items",
            );
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Create
    const handleCreate = async (formData) => {
        try {
            const newItem = await menuService.createMenuItem(formData);
            setMenuItems((prev) => [newItem, ...prev]);
            setIsFormModalOpen(false);
            setSelectedItem(null);
            toast.success("Menu item created successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to create menu item",
            );
            console.error("Error creating item:", err);
        }
    };

    // Handle Update
    const handleUpdate = async (formData) => {
        try {
            const updatedItem = await menuService.updateMenuItem(
                selectedItem.id,
                formData,
            );
            setMenuItems((prev) =>
                prev.map((item) =>
                    item.id === updatedItem.id ? updatedItem : item,
                ),
            );
            setIsFormModalOpen(false);
            setSelectedItem(null);
            toast.success("Menu item updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update menu item",
            );
            console.error("Error updating item:", err);
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        try {
            await menuService.deleteMenuItem(selectedItem.id);
            setMenuItems((prev) =>
                prev.filter((item) => item.id !== selectedItem.id),
            );
            setSelectedItem(null);
            toast.success("Menu item deleted successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete menu item",
            );
            console.error("Error deleting item:", err);
        }
    };

    // Handle Duplicate
    const handleDuplicate = (item) => {
        setSelectedItem({ ...item, id: null, name: `${item.name} (Copy)` });
        setIsFormModalOpen(true);
    };

    // Handle Edit
    const handleEdit = (item) => {
        setSelectedItem(item);
        setIsFormModalOpen(true);
    };

    // Handle Photos Update
    const handlePhotosUpdate = (updatedPhotos) => {
        // Update selected item with new photos
        setSelectedItem((prev) => ({
            ...prev,
            photos: updatedPhotos,
        }));

        // Update in menu items list
        setMenuItems((prev) =>
            prev.map((item) =>
                item.id === selectedItem.id
                    ? { ...item, photos: updatedPhotos }
                    : item,
            ),
        );
    };

    // Filter and sort menu items
    const getFilteredItems = () => {
        let filtered = [...menuItems];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(
                (item) => item.categoryId === categoryFilter,
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter((item) => item.status === statusFilter);
        }

        // Sort
        switch (sortBy) {
            case "price-low":
                filtered.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                filtered.sort((a, b) => b.price - a.price);
                break;
            case "name":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "newest":
            default:
                // Assuming newer items are added to the end
                filtered.reverse();
                break;
        }

        return filtered;
    };

    const filteredItems = getFilteredItems();

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="large" text="Loading menu items..." />
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Menu Items
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your restaurant&apos;s menu items
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedItem(null);
                        setIsFormModalOpen(true);
                    }}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                    + Add Menu Item
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6">
                    <ErrorMessage message={error} onRetry={fetchData} />
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3">
                {/* Search */}
                <div className="min-w-50">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="">All Status</option>
                    <option value={MENU_STATUS.AVAILABLE}>Available</option>
                    <option value={MENU_STATUS.UNAVAILABLE}>Unavailable</option>
                    <option value={MENU_STATUS.SOLD_OUT}>Sold Out</option>
                </select>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    <option value="newest">Sort by: Newest</option>
                    <option value="name">Sort by: Name</option>
                    <option value="price-low">Sort by: Price (Low)</option>
                    <option value="price-high">Sort by: Price (High)</option>
                </select>
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-lg">No menu items found</p>
                    <button
                        onClick={() => {
                            setSelectedItem(null);
                            setIsFormModalOpen(true);
                        }}
                        className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Create Your First Item
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={(item) => {
                                setSelectedItem(item);
                                setIsDeleteDialogOpen(true);
                            }}
                            onDuplicate={handleDuplicate}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedItem(null);
                }}
                title={selectedItem?.id ? "Edit Menu Item" : "Create Menu Item"}
                size="large"
            >
                <MenuItemEditor
                    item={selectedItem}
                    categories={categories}
                    onSubmit={selectedItem?.id ? handleUpdate : handleCreate}
                    onCancel={() => {
                        setIsFormModalOpen(false);
                        setSelectedItem(null);
                    }}
                    onPhotosUpdate={handlePhotosUpdate}
                />
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedItem(null);
                }}
                onConfirm={handleDelete}
                title="Delete Menu Item"
                message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

export default MenuManagement;
