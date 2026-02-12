/**
 * Badge - Reusable badge component
 */
function Badge({ children, variant = "default", icon, className = "" }) {
    const variants = {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-blue-100 text-blue-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        >
            {icon && <span className="w-3 h-3">{icon}</span>}
            {children}
        </span>
    );
}

export default Badge;
