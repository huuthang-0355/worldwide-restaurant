/**
 * Select - Reusable select component
 */
function Select({
    label,
    error,
    required = false,
    options = [],
    placeholder = "Select an option",
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
            <select
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    error ? "border-red-500" : ""
                } ${className}`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

export default Select;
