/**
 * IconButton - Small icon-only button
 */
function IconButton({
    icon,
    variant = "ghost",
    size = "medium",
    disabled = false,
    onClick,
    title,
    className = "",
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        ghost: "text-gray-700 hover:bg-gray-100",
        primary: "text-blue-600 hover:bg-blue-50",
        danger: "text-red-600 hover:bg-red-50",
        success: "text-green-600 hover:bg-green-50",
    };

    const sizes = {
        small: "w-8 h-8 text-sm",
        medium: "w-10 h-10",
        large: "w-12 h-12 text-lg",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {icon}
        </button>
    );
}

export default IconButton;
