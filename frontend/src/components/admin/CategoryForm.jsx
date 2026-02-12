import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Button from "../ui/Button";

const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const INITIAL_FORM = {
    name: "",
    description: "",
    displayOrder: "",
    status: "ACTIVE",
};

/**
 * CategoryForm - Form for creating / editing a category
 */
function CategoryForm({ category, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const isEditing = Boolean(category?.id);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || "",
                description: category.description || "",
                displayOrder:
                    category.displayOrder != null
                        ? String(category.displayOrder)
                        : "",
                status: category.status || "ACTIVE",
            });
        } else {
            setFormData(INITIAL_FORM);
        }
    }, [category]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        else if (formData.name.length < 2 || formData.name.length > 50)
            newErrors.name = "Name must be 2-50 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field])
            setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                displayOrder: formData.displayOrder
                    ? Number(formData.displayOrder)
                    : undefined,
                status: formData.status,
            };
            await onSubmit(payload);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Category Name"
                required
                value={formData.name}
                onChange={handleChange("name")}
                error={errors.name}
                placeholder="e.g. Appetizers"
                maxLength={50}
            />

            <Textarea
                label="Description"
                value={formData.description}
                onChange={handleChange("description")}
                placeholder="Optional description..."
                rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Display Order"
                    type="number"
                    min={0}
                    value={formData.displayOrder}
                    onChange={handleChange("displayOrder")}
                    placeholder="0"
                />

                <Select
                    label="Status"
                    value={formData.status}
                    onChange={handleChange("status")}
                    options={statusOptions}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                    {isEditing ? "Update Category" : "Create Category"}
                </Button>
            </div>
        </form>
    );
}

export default CategoryForm;
