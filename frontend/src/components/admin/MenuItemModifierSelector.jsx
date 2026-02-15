import { useState, useEffect } from "react";
import { Settings2, Check } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import LoadingSpinner from "../common/LoadingSpinner";

/**
 * MenuItemModifierSelector - Component to assign modifier groups to a menu item
 */
function MenuItemModifierSelector({
    menuItem,
    availableGroups,
    onSave,
    onCancel,
    loading,
}) {
    // Track selected modifier group IDs
    const [selectedIds, setSelectedIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Initialize with already-assigned modifier groups
    useEffect(() => {
        if (menuItem?.modifierGroups) {
            setSelectedIds(menuItem.modifierGroups.map((g) => g.id));
        }
    }, [menuItem?.modifierGroups]);

    const toggleGroup = (groupId) => {
        setSelectedIds((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId],
        );
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await onSave(selectedIds);
        } finally {
            setSubmitting(false);
        }
    };

    const hasChanges =
        JSON.stringify(
            [...(menuItem?.modifierGroups?.map((g) => g.id) || [])].sort(),
        ) !== JSON.stringify([...selectedIds].sort());

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner text="Loading modifier groups..." />
            </div>
        );
    }

    if (!availableGroups || availableGroups.length === 0) {
        return (
            <div className="text-center py-12">
                <Settings2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                    No modifier groups available. Create modifier groups first.
                </p>
                <Button variant="secondary" onClick={onCancel}>
                    Close
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
                Select which modifier groups should be available for this menu
                item. Customers will be able to customize their order with these
                options.
            </p>

            {/* Modifier Group List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableGroups.map((group) => {
                    const isSelected = selectedIds.includes(group.id);
                    const isActive = group.status === "ACTIVE";
                    const optionCount = group.options?.length || 0;

                    return (
                        <button
                            key={group.id}
                            type="button"
                            onClick={() => toggleGroup(group.id)}
                            disabled={!isActive}
                            className={`w-full text-left transition-all ${
                                !isActive ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            <Card
                                className={`flex items-center gap-3 p-3 ${
                                    isSelected
                                        ? "ring-2 ring-primary-500 bg-primary-50"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                {/* Checkbox */}
                                <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                        isSelected
                                            ? "bg-primary-500 border-primary-500"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-white" />
                                    )}
                                </div>

                                {/* Icon */}
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected
                                            ? "bg-primary-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    <Settings2
                                        className={`w-5 h-5 ${
                                            isSelected
                                                ? "text-primary-500"
                                                : "text-gray-400"
                                        }`}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-gray-800 text-sm">
                                            {group.name}
                                        </h4>
                                        {group.isRequired && (
                                            <Badge
                                                variant="danger"
                                                className="text-xs"
                                            >
                                                Required
                                            </Badge>
                                        )}
                                        {!isActive && (
                                            <Badge
                                                variant="default"
                                                className="text-xs"
                                            >
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {group.selectionType === "SINGLE"
                                            ? "Single select"
                                            : "Multi select"}{" "}
                                        · {optionCount}{" "}
                                        {optionCount === 1
                                            ? "option"
                                            : "options"}
                                    </p>
                                </div>
                            </Card>
                        </button>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                    <span className="font-medium">{selectedIds.length}</span>{" "}
                    modifier group{selectedIds.length !== 1 ? "s" : ""} selected
                </p>
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
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    loading={submitting}
                >
                    Save Modifiers
                </Button>
            </div>
        </div>
    );
}

export default MenuItemModifierSelector;
