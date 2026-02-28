import { useState, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import { useSession } from "../../context/useSession";
import { useToast } from "../../context/useToast";
import { formatPrice } from "../../utils/formatCurrency";
import MenuStatusBadge from "../../components/customer/MenuStatusBadge";
import ItemModifierSection from "../../components/customer/ItemModifierSection";
import RelatedItemCard from "../../components/customer/RelatedItemCard";
import { MENU_STATUS } from "../../constants/menuStatus";
import { ArrowLeft, Minus, Plus, Loader2, Clock, Utensils } from "lucide-react";

/**
 * ItemDetailWrapper — extracts route param and passes `key={id}` so that
 * ItemDetailInner fully remounts when navigating between items.
 * This avoids ref-during-render and setState-in-effect issues with React 19.
 */
function ItemDetail() {
    const { id } = useParams();
    return <ItemDetailInner key={id} itemId={id} />;
}

/**
 * ItemDetailInner — full item detail page matching the mockup.
 *
 * Sections: hero image, title/price/rating, meta, description,
 * modifier sections, special instructions, related items, reviews,
 * and a sticky "Add to Cart" bar with quantity control.
 */
function ItemDetailInner({ itemId }) {
    const navigate = useNavigate();
    const { getItemById, items, sessionValid } = useCustomerMenu();
    const { addToCart, cartLoading } = useSession();
    const { showToast } = useToast();

    const item = getItemById(itemId);

    // Compute default modifier selections from item data
    const defaultSelections = useMemo(() => {
        if (!item?.modifierGroups) return {};
        const defaults = {};
        item.modifierGroups.forEach((group) => {
            if (
                group.selectionType === "SINGLE" &&
                group.isRequired &&
                group.options?.length
            ) {
                defaults[group.id] = group.options[0].id;
            }
        });
        return defaults;
    }, [item]);

    // ==================== Local State ====================
    const [quantity, setQuantity] = useState(1);
    const [modifierSelections, setModifierSelections] =
        useState(defaultSelections);
    const [specialInstructions, setSpecialInstructions] = useState("");

    // Calculate total price including modifiers
    const totalPrice = useMemo(() => {
        if (!item) return 0;
        let base = item.price || 0;

        item.modifierGroups?.forEach((group) => {
            if (group.selectionType === "SINGLE") {
                const selectedOptionId = modifierSelections[group.id];
                const option = group.options?.find(
                    (o) => o.id === selectedOptionId,
                );
                if (option) base += option.priceAdjustment || 0;
            } else {
                group.options?.forEach((option) => {
                    if (modifierSelections[option.id]) {
                        base += option.priceAdjustment || 0;
                    }
                });
            }
        });

        return base * quantity;
    }, [item, modifierSelections, quantity]);

    // Related items — other items from the same list, excluding the current
    const relatedItems = useMemo(() => {
        if (!item) return [];
        return items.filter((i) => i.id !== item.id).slice(0, 6);
    }, [items, item]);

    // Modifier change handler
    const handleModifierChange = (groupId, optionId, checked) => {
        setModifierSelections((prev) => {
            const group = item.modifierGroups?.find((g) => g.id === groupId);
            if (!group) return prev;

            if (group.selectionType === "SINGLE") {
                return { ...prev, [groupId]: optionId };
            } else {
                return { ...prev, [optionId]: checked };
            }
        });
    };

    const handleRelatedClick = (relatedItem) => {
        navigate(`/menu/item/${relatedItem.id}`);
    };

    const handleAddToCart = async () => {
        try {
            // Build modifierOptionIds array from selections
            const modifierOptionIds = [];
            item.modifierGroups?.forEach((group) => {
                if (group.selectionType === "SINGLE") {
                    const selectedOptionId = modifierSelections[group.id];
                    if (selectedOptionId) {
                        modifierOptionIds.push(selectedOptionId);
                    }
                } else {
                    // MULTIPLE
                    group.options?.forEach((option) => {
                        if (modifierSelections[option.id]) {
                            modifierOptionIds.push(option.id);
                        }
                    });
                }
            });

            const data = {
                menuItemId: item.id,
                quantity,
                modifierOptionIds:
                    modifierOptionIds.length > 0
                        ? modifierOptionIds
                        : undefined,
                specialInstructions: specialInstructions.trim() || undefined,
            };

            await addToCart(data);
            showToast("Item added to cart!", "success");
            navigate("/menu/cart");
        } catch (error) {
            console.error("Add to cart error:", error);
            console.error("Error response:", error.response?.data);
            showToast(
                error.response?.data?.message || "Failed to add item to cart",
                "error",
            );
        }
    };

    const isSoldOut = item?.status === MENU_STATUS.SOLD_OUT;
    const isUnavailable = item?.status === MENU_STATUS.UNAVAILABLE;
    const disabled = isSoldOut || isUnavailable;

    // ==================== Guards ====================
    if (!sessionValid) {
        return <Navigate to="/menu" replace />;
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center p-10 min-h-96">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading item…</p>
            </div>
        );
    }

    return (
        <div className="pb-28">
            {/* Back header */}
            <div className="bg-primary-500 text-white px-5 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-lg">Item Details</span>
            </div>

            {/* Hero Image */}
            <div className="h-52 bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                {item.primaryPhotoUrl ? (
                    <img
                        src={item.primaryPhotoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-7xl">🍽️</span>
                )}
            </div>

            {/* Item content */}
            <div className="px-5 py-5">
                {/* Title & Price */}
                <div className="flex items-start justify-between mb-2">
                    <h1 className="text-xl font-bold text-gray-800">
                        {item.name}
                    </h1>
                    <span className="text-xl font-bold text-primary-500 whitespace-nowrap ml-4">
                        {formatPrice(item.price)}
                    </span>
                </div>

                {/* Rating */}
                {item.averageRating > 0 && (
                    <div className="text-sm text-yellow-500 mb-2.5">
                        {"★".repeat(Math.round(item.averageRating))}
                        {"☆".repeat(5 - Math.round(item.averageRating))}
                        <span className="text-gray-400 ml-1">
                            ({item.reviewCount || 0} reviews)
                        </span>
                    </div>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                    {item.prepTime && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />~{item.prepTime}{" "}
                            min
                        </span>
                    )}
                    {item.allergens && (
                        <span className="flex items-center gap-1">
                            <Utensils className="w-3.5 h-3.5" />
                            {item.allergens}
                        </span>
                    )}
                    <MenuStatusBadge status={item.status} />
                </div>

                {/* Description */}
                {item.description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {item.description}
                    </p>
                )}

                {/* Modifier Sections */}
                {item.modifierGroups?.map((group) => (
                    <ItemModifierSection
                        key={group.id}
                        group={group}
                        selected={modifierSelections}
                        onChange={handleModifierChange}
                    />
                ))}

                {/* Special Instructions */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">
                        Special Instructions
                    </h4>
                    <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any special requests? (e.g., no onions, extra spicy...)"
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl text-sm resize-none outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                {/* Related Items */}
                {relatedItems.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">
                            You might also like
                        </h4>
                        <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-hide">
                            {relatedItems.map((ri) => (
                                <RelatedItemCard
                                    key={ri.id}
                                    item={ri}
                                    onClick={handleRelatedClick}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                {item.reviews?.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">
                            Reviews ({item.reviewCount || item.reviews.length})
                        </h4>
                        <div className="space-y-2.5">
                            {item.reviews.map((review, idx) => (
                                <div
                                    key={review.id || idx}
                                    className="p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <strong className="text-gray-800 text-sm">
                                            {review.customerName || "Anonymous"}
                                        </strong>
                                        <span className="text-yellow-500 text-sm">
                                            {"★".repeat(review.rating || 0)}
                                            {"☆".repeat(
                                                5 - (review.rating || 0),
                                            )}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-500 text-sm">
                                            &ldquo;{review.comment}&rdquo;
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Add to Cart Bar */}
            {!disabled && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-97.5 bg-white px-5 py-4 flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t border-gray-200 z-60">
                    {/* Quantity control */}
                    <div className="flex items-center gap-4 bg-gray-100 rounded-full px-3 py-1.5">
                        <button
                            onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                            }
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold min-w-5 text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add to cart button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={cartLoading}
                        className="flex-1 ml-4 py-3 bg-primary-500 text-white rounded-full font-semibold text-base hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {cartLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>Add to Cart – {formatPrice(totalPrice)}</>
                        )}
                    </button>
                </div>
            )}

            {/* Sold out / unavailable notice */}
            {disabled && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-97.5 bg-gray-200 px-5 py-4 text-center text-gray-500 font-medium shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t border-gray-200 z-60">
                    {isSoldOut
                        ? "This item is currently sold out"
                        : "This item is currently unavailable"}
                </div>
            )}
        </div>
    );
}

export default ItemDetail;
