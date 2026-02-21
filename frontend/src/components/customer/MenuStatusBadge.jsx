import { MENU_STATUS } from "../../constants/menuStatus";

/**
 * MenuStatusBadge — shows item availability with a colored dot.
 * Maps to AVAILABLE (green), SOLD_OUT (red), UNAVAILABLE (gray).
 */
function MenuStatusBadge({ status }) {
    const config = {
        [MENU_STATUS.AVAILABLE]: {
            label: "Available",
            dot: "bg-green-500",
            bg: "bg-green-50",
            text: "text-green-600",
        },
        [MENU_STATUS.SOLD_OUT]: {
            label: "Sold Out",
            dot: "bg-red-500",
            bg: "bg-red-50",
            text: "text-red-600",
        },
        [MENU_STATUS.UNAVAILABLE]: {
            label: "Unavailable",
            dot: "bg-gray-400",
            bg: "bg-gray-50",
            text: "text-gray-500",
        },
    };

    const cfg = config[status] || config[MENU_STATUS.UNAVAILABLE];

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}
        >
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

export default MenuStatusBadge;
