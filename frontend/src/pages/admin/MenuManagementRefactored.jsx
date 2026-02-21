import { useState, useEffect, useMemo } from "react";
import { useMenu } from "../../context/useMenu";
import { useModifier } from "../../context/useModifier";
import { useToast } from "../../context/useToast";
import MenuCard from "../../components/admin/MenuCard";
import MenuItemEditor from "../../components/admin/MenuItemEditor";
import MenuFilters from "../../components/admin/MenuFilters";
import MenuGrid from "../../components/admin/MenuGrid";
import PageHeader, {
    AddMenuItemButton,
} from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { MENU_STATUS } from "../../constants/menuStatus";

/**
 * MenuManagement - Refactored with Context API and small components
 */
function MenuManagement() {
    const toast = useToast();
    const {
        menuItems,
        categories,
        loading,
        error,
        fetchData,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        updateMenuItemPhotos,
        assignModifierGroups,
    } = useMenu();

    const { modifierGroups, fetchModifierGroups } = useModifier();

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        fetchData();
        fetchModifierGroups();
    }, [fetchData, fetchModifierGroups]);

    // Build category id → name lookup
    const categoryMap = useMemo(
        () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
        [categories],
    );

    // CRUD operations
    const handleCreate = async (formData) => {
        try {
            await createMenuItem(formData);
            setIsFormModalOpen(false);
            setSelectedItem(null);
            toast.success("Menu item created successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to create menu item",
            );
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateMenuItem(selectedItem.id, formData);
            setIsFormModalOpen(false);
            setSelectedItem(null);
            toast.success("Menu item updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update menu item",
            );
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMenuItem(selectedItem.id);
            setSelectedItem(null);
            toast.success("Menu item deleted successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete menu item",
            );
        }
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setIsFormModalOpen(true);
    };

    const handlePhotosUpdate = (updatedPhotos) => {
        setSelectedItem((prev) => ({
            ...prev,
            photos: updatedPhotos,
        }));
        updateMenuItemPhotos(selectedItem.id, updatedPhotos);
    };

    const handleModifiersUpdate = async (modifierGroupIds) => {
        try {
            const updatedItem = await assignModifierGroups(
                selectedItem.id,
                modifierGroupIds,
            );
            setSelectedItem(updatedItem);
            toast.success("Modifier groups updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to assign modifier groups",
            );
        }
    };

    // Filter and sort
    const getFilteredItems = () => {
        let filtered = [...menuItems];

        if (searchQuery) {
            filtered = filtered.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(
                (item) => item.categoryId === categoryFilter,
            );
        }

        if (statusFilter) {
            filtered = filtered.filter((item) => item.status === statusFilter);
        }

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
                filtered.reverse();
                break;
        }

        return filtered;
    };

    const filteredItems = getFilteredItems();

    const statusOptions = [
        { value: MENU_STATUS.AVAILABLE, label: "Available" },
        { value: MENU_STATUS.UNAVAILABLE, label: "Unavailable" },
        { value: MENU_STATUS.SOLD_OUT, label: "Sold Out" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="large" text="Loading menu items..." />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Menu Items"
                subtitle="Manage your restaurant's menu items"
                action={
                    <AddMenuItemButton
                        onClick={() => {
                            setSelectedItem(null);
                            setIsFormModalOpen(true);
                        }}
                    />
                }
            />

            {error && (
                <div className="mb-6">
                    <ErrorMessage message={error} onRetry={fetchData} />
                </div>
            )}

            <div className="mb-6">
                <MenuFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    categories={categories}
                    statusOptions={statusOptions}
                />
            </div>

            {filteredItems.length === 0 ? (
                <EmptyState
                    message="No menu items found"
                    action={
                        <AddMenuItemButton
                            onClick={() => {
                                setSelectedItem(null);
                                setIsFormModalOpen(true);
                            }}
                        />
                    }
                />
            ) : (
                <MenuGrid>
                    {filteredItems.map((item) => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            categoryName={categoryMap[item.categoryId]}
                            onEdit={handleEdit}
                            onDelete={(item) => {
                                setSelectedItem(item);
                                setIsDeleteDialogOpen(true);
                            }}
                        />
                    ))}
                </MenuGrid>
            )}

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
                    modifierGroups={modifierGroups}
                    onSubmit={selectedItem?.id ? handleUpdate : handleCreate}
                    onCancel={() => {
                        setIsFormModalOpen(false);
                        setSelectedItem(null);
                    }}
                    onPhotosUpdate={handlePhotosUpdate}
                    onModifiersUpdate={handleModifiersUpdate}
                />
            </Modal>

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
