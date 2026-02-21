/**
 * Checkbox - Reusable checkbox component
 */
function Checkbox({ label, id, className = "", ...props }) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id={id}
                className={`w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 ${className}`}
                {...props}
            />
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                    {label}
                </label>
            )}
        </div>
    );
}

export default Checkbox;
