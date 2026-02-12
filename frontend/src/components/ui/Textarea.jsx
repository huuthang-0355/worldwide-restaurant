/**
 * Textarea - Reusable textarea component
 */
function Textarea({
    label,
    error,
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
            <textarea
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-y ${
                    error ? "border-red-500" : ""
                } ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export default Textarea;
