/**
 * Input - Reusable input component
 */
function Input({
    label,
    error,
    icon,
    required = false,
    className = "",
    ...props
}) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        icon ? "pl-10" : ""
                    } ${error ? "border-red-500" : ""} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export default Input;
