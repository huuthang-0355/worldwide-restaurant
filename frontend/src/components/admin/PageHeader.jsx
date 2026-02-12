import { Plus } from "lucide-react";
import Button from "../ui/Button";

/**
 * PageHeader - Reusable page header component
 */
function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            {action && action}
        </div>
    );
}

/**
 * AddMenuItemButton - Specific button for adding menu items
 */
export function AddMenuItemButton({ onClick }) {
    return (
        <Button icon={<Plus className="w-4 h-4" />} onClick={onClick}>
            Add Menu Item
        </Button>
    );
}

export default PageHeader;
