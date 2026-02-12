import { Edit, Trash2, Star, Utensils } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import IconButton from "../ui/IconButton";
import { STATUS_CONFIG } from "../../constants/menuStatus";
import { formatVND } from "../../utils/formatCurrency";

/**
 * MenuCard - Card component for menu items
 */
function MenuCard({ item, categoryName, onEdit, onDelete }) {
    const statusConfig = STATUS_CONFIG[item.status] || {};
    const primaryPhoto =
        item.photos?.find((p) => p.isPrimary) || item.photos?.[0];

    return (
        <Card hover padding={false}>
            {/* Image */}
            <div className="bg-gray-100 h-40 flex items-center justify-center overflow-hidden">
                {primaryPhoto ? (
                    <img
                        src={primaryPhoto.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Utensils className="w-12 h-12 text-gray-400" />
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-lg font-bold text-gray-800 flex-1 line-clamp-1">
                        {item.name}
                    </h4>
                    <span
                        className={`w-3 h-3 rounded-full shrink-0 mt-1 ${statusConfig.color}`}
                    />
                </div>

                {/* Category */}
                {categoryName && (
                    <Badge variant="primary">{categoryName}</Badge>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-10">
                    {item.description || "No description available"}
                </p>

                {/* Price & Time */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-lg font-bold text-emerald-600">
                        {formatVND(item.price)}
                    </span>
                    {item.prepTimeMinutes && (
                        <span className="text-gray-500">
                            {item.prepTimeMinutes} min
                        </span>
                    )}
                </div>

                {/* Chef Recommended Badge */}
                {item.isChefRecommended && (
                    <Badge
                        variant="warning"
                        icon={<Star className="w-3 h-3" />}
                    >
                        Chef&apos;s Pick
                    </Badge>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <IconButton
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => onEdit(item)}
                        variant="primary"
                        title="Edit"
                        size="medium"
                        className="flex-1 rounded-md"
                    />
                    <IconButton
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => onDelete(item)}
                        variant="danger"
                        title="Delete"
                        size="medium"
                    />
                </div>
            </div>
        </Card>
    );
}

export default MenuCard;
