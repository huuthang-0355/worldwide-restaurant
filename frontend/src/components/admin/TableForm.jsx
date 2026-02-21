import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

/**
 * TableForm - Creates or edits a table
 * Fields: tableNumber, capacity, location, description
 */
function TableForm({ table, onSubmit, onCancel }) {
    const isEditing = Boolean(table?.id);

    const [formData, setFormData] = useState({
        tableNumber: "",
        capacity: "",
        location: "",
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (table) {
            setFormData({
                tableNumber: table.tableNumber || "",
                capacity: table.capacity || "",
                location: table.location || "",
                description: table.description || "",
            });
        }
    }, [table]);

    const locationOptions = [
        { value: "Indoor", label: "Indoor" },
        { value: "Outdoor", label: "Outdoor" },
        { value: "Patio", label: "Patio" },
        { value: "VIP Room", label: "VIP Room" },
        { value: "Window", label: "Window" },
        { value: "Main Hall", label: "Main Hall" },
        { value: "Private", label: "Private" },
    ];

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.tableNumber.trim()) {
            newErrors.tableNumber = "Table number is required";
        }

        const cap = parseInt(formData.capacity, 10);
        if (!formData.capacity) {
            newErrors.capacity = "Capacity is required";
        } else if (isNaN(cap) || cap < 1 || cap > 20) {
            newErrors.capacity = "Capacity must be between 1 and 20";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await onSubmit({
                tableNumber: formData.tableNumber.trim(),
                capacity: parseInt(formData.capacity, 10),
                location: formData.location || undefined,
                description: formData.description.trim() || undefined,
            });
        } catch {
            // Error handled by parent
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Table Number"
                required
                value={formData.tableNumber}
                onChange={(e) => handleChange("tableNumber", e.target.value)}
                error={errors.tableNumber}
                placeholder="e.g. T-5"
            />

            <Input
                label="Capacity (seats)"
                required
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                error={errors.capacity}
                placeholder="1 – 20"
            />

            <Select
                label="Location"
                options={locationOptions}
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Select location (optional)"
            />

            <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Optional description..."
                rows={3}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                    {isEditing ? "Update Table" : "Create Table"}
                </Button>
            </div>
        </form>
    );
}

export default TableForm;
