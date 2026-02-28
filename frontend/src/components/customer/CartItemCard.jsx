import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "../../utils/formatCurrency";

/**
 * CartItemCard — single cart item row matching the cart mockup.
 *
 * Shows: item name, modifiers, special instructions, price,
 * quantity controls (+/-), and a remove button.
 */
function CartItemCard({ item, onUpdateQuantity, onRemove, disabled }) {
    // Build modifier display text from selectedModifiers array
    const modifierText =
        item.selectedModifiers?.map((m) => m.optionName).join(", ") ||
        item.modifiers?.map((m) => m.modifierOptionName).join(", ") ||
        "";

    // Use lineTotal from backend (includes unitPrice + modifiersPrice) * quantity
    // Fallback to manual calculation if lineTotal not provided
    const displayPrice =
        item.lineTotal ??
        item.totalPrice ??
        ((item.unitPrice ?? item.price ?? 0) + (item.modifiersPrice ?? 0)) *
            (item.quantity || 1);

    return (
        <div className="flex gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Thumbnail placeholder */}
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                🍽️
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm truncate">
                    {item.menuItemName}
                </h4>
                {modifierText && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {modifierText}
                    </p>
                )}
                {item.notes && (
                    <p className="text-xs text-amber-600 mt-0.5 italic truncate">
                        {item.notes}
                    </p>
                )}
                <p className="text-primary-600 font-bold text-sm mt-1">
                    {formatPrice(displayPrice)}
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-end justify-between shrink-0">
                {/* Remove */}
                <button
                    onClick={() => onRemove(item.id)}
                    disabled={disabled}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    aria-label="Remove item"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                {/* Quantity */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-1">
                    <button
                        onClick={() =>
                            onUpdateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1),
                            )
                        }
                        disabled={disabled || item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 disabled:opacity-40"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={disabled}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-primary-500 text-white disabled:opacity-40"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartItemCard;
