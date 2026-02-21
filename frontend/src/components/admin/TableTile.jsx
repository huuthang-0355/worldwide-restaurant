import {
    Pencil,
    QrCode,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Users,
    MapPin,
} from "lucide-react";
import TableStatusBadge from "./TableStatusBadge";

/**
 * TableTile - Card representing a single table in the grid
 * Matches mockup: shows table number, status, capacity, location, and action buttons
 */
function TableTile({ table, onEdit, onToggleStatus, onViewQr, onDelete }) {
    const isActive = table.status === "ACTIVE";

    const borderColor = isActive
        ? "border-green-200 hover:border-green-300"
        : "border-gray-200 hover:border-gray-300";

    const bgColor = isActive ? "bg-white" : "bg-gray-50";

    return (
        <div
            className={`rounded-xl border-2 ${borderColor} ${bgColor} p-5 flex flex-col gap-3 transition-all hover:shadow-md`}
        >
            {/* Header: Table number + status */}
            <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                    {table.tableNumber}
                </h3>
                <TableStatusBadge status={table.status} />
            </div>

            {/* Info: capacity + location */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {table.capacity} seats
                </span>
                {table.location && (
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {table.location}
                    </span>
                )}
            </div>

            {/* Description (truncated) */}
            {table.description && (
                <p className="text-xs text-gray-400 line-clamp-2">
                    {table.description}
                </p>
            )}

            {/* QR status indicator */}
            <div className="text-xs">
                {table.hasQrCode ? (
                    <span className="text-green-600 font-medium">
                        ● QR Code Active
                    </span>
                ) : (
                    <span className="text-amber-500 font-medium">
                        ○ No QR Code
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                <button
                    onClick={() => onViewQr(table)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                    title="View QR"
                >
                    <QrCode className="w-3.5 h-3.5" />
                    QR
                </button>
                <button
                    onClick={() => onEdit(table)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Edit"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                </button>
                <button
                    onClick={() =>
                        onToggleStatus(
                            table.id,
                            isActive ? "INACTIVE" : "ACTIVE",
                        )
                    }
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                    title={isActive ? "Deactivate" : "Activate"}
                >
                    {isActive ? (
                        <ToggleRight className="w-3.5 h-3.5" />
                    ) : (
                        <ToggleLeft className="w-3.5 h-3.5" />
                    )}
                    {isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                    onClick={() => onDelete(table)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-auto"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default TableTile;
