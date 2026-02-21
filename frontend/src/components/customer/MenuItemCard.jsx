import { useNavigate } from "react-router-dom";
import { MENU_STATUS } from "../../constants/menuStatus";
import { formatPrice } from "../../utils/formatCurrency";
import MenuStatusBadge from "./MenuStatusBadge";

/**
 * MenuItemCard — single item row in the menu list.
 * Matches the mockup: image left, info right, price + "Add" button bottom.
 * Entire card is tappable to navigate to item detail.
 */
function MenuItemCard({ item }) {
    const navigate = useNavigate();
    const isSoldOut = item.status === MENU_STATUS.SOLD_OUT;
    const isUnavailable = item.status === MENU_STATUS.UNAVAILABLE;
    const disabled = isSoldOut || isUnavailable;

    const handleClick = () => {
        navigate(`/menu/item/${item.id}`);
    };

    const handleAddClick = (e) => {
        e.stopPropagation();
        // Cart integration will be added in a future step
        navigate(`/menu/item/${item.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex cursor-pointer hover:shadow-md transition-shadow ${
                disabled ? "opacity-70" : ""
            }`}
        >
            {/* Image */}
            <div className="w-30 h-30 shrink-0 bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden">
                {item.primaryPhotoUrl ? (
                    <img
                        src={item.primaryPhotoUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-white text-4xl">🍽️</span>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                <div>
                    <h3 className="text-base font-semibold text-gray-800 truncate">
                        {item.name}
                    </h3>
                    {item.isChefRecommended && (
                        <span className="text-yellow-500 text-sm">
                            ⭐ Chef&apos;s Pick
                        </span>
                    )}
                    <MenuStatusBadge status={item.status} />
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary-500">
                        {formatPrice(item.price)}
                    </span>
                    {!disabled && (
                        <button
                            onClick={handleAddClick}
                            className="bg-primary-500 text-white border-none px-5 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary-600 transition-colors"
                        >
                            + Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MenuItemCard;
