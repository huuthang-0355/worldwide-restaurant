import { formatPrice } from "../../utils/formatCurrency";

/**
 * RelatedItemCard — small card shown in the "You might also like" section.
 * Matches the mockup's horizontal scroll of mini-cards.
 */
function RelatedItemCard({ item, onClick }) {
    return (
        <div
            onClick={() => onClick?.(item)}
            className="min-w-30 text-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
        >
            <div className="w-full h-16 flex items-center justify-center overflow-hidden rounded-lg mb-2">
                {item.primaryPhotoUrl ? (
                    <img
                        src={item.primaryPhotoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                    />
                ) : (
                    <span className="text-4xl">🍽️</span>
                )}
            </div>
            <p className="text-sm text-gray-700 mt-1 truncate">{item.name}</p>
            <p className="text-primary-500 font-semibold text-sm">
                {formatPrice(item.price)}
            </p>
        </div>
    );
}

export default RelatedItemCard;
