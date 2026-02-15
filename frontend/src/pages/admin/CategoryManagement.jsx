import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useCategory } from "../../context/useCategory";
import { useToast } from "../../context/useToast";
import CategoryCard from "../../components/admin/CategoryCard";
import CategoryForm from "../../components/admin/CategoryForm";
import CategoryList from "../../components/admin/CategoryList";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/ui/Button";

/**
 * CategoryManagement - CRUD page for food categories
 */
function CategoryManagement() {
    const {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        updateCategoryStatus,
    } = useCategory();
    const toast = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreate = async (formData) => {
        try {
            await createCategory(formData);
            closeForm();
            toast.success("Category created successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to create category",
            );
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateCategory(selectedCategory.id, formData);
            closeForm();
            toast.success("Category updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update category",
            );
        }
    };

    const handleToggleStatus = async (id, newStatus) => {
        try {
            await updateCategoryStatus(id, newStatus);
            toast.success("Status updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update status",
            );
        }
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedCategory(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="large" text="Loading categories..." />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Categories"
                subtitle="Manage your menu categories"
                action={
                    <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => {
                            setSelectedCategory(null);
                            setIsFormOpen(true);
                        }}
                    >
                        Add Category
                    </Button>
                }
            />

            {error && (
                <div className="mb-6">
                    <ErrorMessage message={error} onRetry={fetchCategories} />
                </div>
            )}

            {categories.length === 0 ? (
                <EmptyState
                    message="No categories yet. Create your first category to get started."
                    action={
                        <Button
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setIsFormOpen(true)}
                        >
                            Add Category
                        </Button>
                    }
                />
            ) : (
                <CategoryList>
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </CategoryList>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={selectedCategory?.id ? "Edit Category" : "New Category"}
                size="medium"
            >
                <CategoryForm
                    category={selectedCategory}
                    onSubmit={
                        selectedCategory?.id ? handleUpdate : handleCreate
                    }
                    onCancel={closeForm}
                />
            </Modal>
        </div>
    );
}

export default CategoryManagement;
