/**
 * TableStatusBadge - Visual status indicator for tables
 * Statuses: ACTIVE, INACTIVE
 */
function TableStatusBadge({ status }) {
    const config = {
        ACTIVE: {
            label: "Active",
            dot: "bg-green-500",
            bg: "bg-green-50",
            text: "text-green-700",
        },
        INACTIVE: {
            label: "Inactive",
            dot: "bg-gray-400",
            bg: "bg-gray-100",
            text: "text-gray-600",
        },
    };

    const { label, dot, bg, text } = config[status] || config.INACTIVE;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
        >
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
        </span>
    );
}

export default TableStatusBadge;
