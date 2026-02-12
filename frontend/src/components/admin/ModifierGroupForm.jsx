import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Checkbox from "../ui/Checkbox";
import Button from "../ui/Button";

const selectionTypeOptions = [
    { value: "SINGLE", label: "Single Select" },
    { value: "MULTIPLE", label: "Multiple Select" },
];

const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const INITIAL_FORM = {
    name: "",
    selectionType: "SINGLE",
    isRequired: false,
    minSelection: "",
    maxSelection: "",
    displayOrder: "",
    status: "ACTIVE",
};

/**
 * ModifierGroupForm - Form to create / edit a modifier group
 */
function ModifierGroupForm({ group, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const isEditing = Boolean(group?.id);

    useEffect(() => {
        if (group) {
            setFormData({
                name: group.name || "",
                selectionType: group.selectionType || "SINGLE",
                isRequired: group.isRequired ?? false,
                minSelection:
                    group.minSelection != null
                        ? String(group.minSelection)
                        : "",
                maxSelection:
                    group.maxSelection != null
                        ? String(group.maxSelection)
                        : "",
                displayOrder:
                    group.displayOrder != null
                        ? String(group.displayOrder)
                        : "",
                status: group.status || "ACTIVE",
            });
        } else {
            setFormData(INITIAL_FORM);
        }
    }, [group]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field) => (e) => {
        const value =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
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
                selectionType: formData.selectionType,
                isRequired: formData.isRequired,
                minSelection: formData.minSelection
                    ? Number(formData.minSelection)
                    : undefined,
                maxSelection: formData.maxSelection
                    ? Number(formData.maxSelection)
                    : undefined,
                displayOrder: formData.displayOrder
                    ? Number(formData.displayOrder)
                    : undefined,
                status: formData.status,
            };
            console.log("🔵 ModifierGroupForm submitting payload:", payload);
            await onSubmit(payload);
            console.log("🟢 ModifierGroupForm submit successful");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Group Name"
                required
                value={formData.name}
                onChange={handleChange("name")}
                error={errors.name}
                placeholder="e.g. Pizza Size"
            />

            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="Selection Type"
                    value={formData.selectionType}
                    onChange={handleChange("selectionType")}
                    options={selectionTypeOptions}
                />

                <Select
                    label="Status"
                    value={formData.status}
                    onChange={handleChange("status")}
                    options={statusOptions}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Input
                    label="Min Selections"
                    type="number"
                    min={0}
                    value={formData.minSelection}
                    onChange={handleChange("minSelection")}
                    placeholder="0"
                />
                <Input
                    label="Max Selections"
                    type="number"
                    min={0}
                    value={formData.maxSelection}
                    onChange={handleChange("maxSelection")}
                    placeholder="No limit"
                />
                <Input
                    label="Display Order"
                    type="number"
                    min={0}
                    value={formData.displayOrder}
                    onChange={handleChange("displayOrder")}
                    placeholder="0"
                />
            </div>

            <Checkbox
                id="isRequired"
                label="Required modifier"
                checked={formData.isRequired}
                onChange={handleChange("isRequired")}
            />

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
                    {isEditing ? "Update Group" : "Create Group"}
                </Button>
            </div>
        </form>
    );
}

export default ModifierGroupForm;
