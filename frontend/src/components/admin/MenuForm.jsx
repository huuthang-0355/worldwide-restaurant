import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Checkbox from "../ui/Checkbox";
import Button from "../ui/Button";
import { MENU_STATUS } from "../../constants/menuStatus";

/**
 * MenuForm - Refactored form for creating/editing menu items
 */
function MenuForm({ item, categories, onSubmit, onCancel }) {
    const getInitialFormData = () => ({
        name: item?.name || "",
        description: item?.description || "",
        price: item?.price || "",
        prepTimeMinutes: item?.prepTimeMinutes || "",
        status: item?.status || MENU_STATUS.AVAILABLE,
        isChefRecommended: item?.isChefRecommended || false,
        categoryId: item?.categoryId || "",
    });

    const [formData, setFormData] = useState(getInitialFormData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(getInitialFormData());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?.id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim() || formData.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }
        if (formData.name.length > 50) {
            newErrors.name = "Name must not exceed 50 characters";
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = "Price must be greater than 0";
        }
        if (
            formData.prepTimeMinutes &&
            (parseInt(formData.prepTimeMinutes) < 0 ||
                parseInt(formData.prepTimeMinutes) > 240)
        ) {
            newErrors.prepTimeMinutes =
                "Prep time must be between 0 and 240 minutes";
        }
        if (!formData.categoryId) {
            newErrors.categoryId = "Category is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                prepTimeMinutes: formData.prepTimeMinutes
                    ? parseInt(formData.prepTimeMinutes)
                    : null,
            };
            onSubmit(submitData);
        }
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));

    const statusOptions = [
        { value: MENU_STATUS.AVAILABLE, label: "Available" },
        { value: MENU_STATUS.UNAVAILABLE, label: "Unavailable" },
        { value: MENU_STATUS.SOLD_OUT, label: "Sold Out" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Grilled Salmon"
                error={errors.name}
                required
            />

            <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the menu item..."
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Price (₫)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    step="1000"
                    min="0"
                    placeholder="0"
                    error={errors.price}
                    required
                />

                <Input
                    label="Prep Time (min)"
                    name="prepTimeMinutes"
                    type="number"
                    value={formData.prepTimeMinutes}
                    onChange={handleChange}
                    min="0"
                    max="240"
                    placeholder="e.g., 15"
                    error={errors.prepTimeMinutes}
                />
            </div>

            <Select
                label="Category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                options={categoryOptions}
                placeholder="Select a category"
                error={errors.categoryId}
                required
            />

            <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                required
            />

            <Checkbox
                id="isChefRecommended"
                name="isChefRecommended"
                checked={formData.isChefRecommended}
                onChange={handleChange}
                label="Mark as Chef's Recommendation"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary">
                    {item ? "Update Item" : "Create Item"}
                </Button>
            </div>
        </form>
    );
}

export default MenuForm;
