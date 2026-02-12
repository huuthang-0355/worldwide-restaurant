import { Edit, FolderOpen, GripVertical } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import IconButton from "../ui/IconButton";

/**
 * CategoryCard - Displays a single category with its info and actions
 */
function CategoryCard({ category, onEdit, onToggleStatus }) {
    const isActive = category.status === "ACTIVE";
    const itemCount = category.menuItems?.length || 0;

    return (
        <Card hover className="flex items-center gap-4 p-4">
            {/* Drag Handle */}
            <GripVertical className="w-5 h-5 text-gray-300 shrink-0 cursor-grab" />

            {/* Icon */}
            <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-blue-100" : "bg-gray-100"
                }`}
            >
                <FolderOpen
                    className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">
                        {category.name}
                    </h3>
                    <Badge variant={isActive ? "success" : "default"}>
                        {category.status}
                    </Badge>
                </div>
                {category.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                        {category.description}
                    </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                    {itemCount} {itemCount === 1 ? "item" : "items"} &middot;
                    Order: {category.displayOrder ?? "—"}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={() =>
                        onToggleStatus(
                            category.id,
                            isActive ? "INACTIVE" : "ACTIVE",
                        )
                    }
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                        isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                    title={isActive ? "Deactivate" : "Activate"}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            isActive ? "translate-x-4" : ""
                        }`}
                    />
                </button>
                <IconButton
                    icon={<Edit className="w-4 h-4" />}
                    variant="primary"
                    title="Edit"
                    onClick={() => onEdit(category)}
                />
            </div>
        </Card>
    );
}

export default CategoryCard;
