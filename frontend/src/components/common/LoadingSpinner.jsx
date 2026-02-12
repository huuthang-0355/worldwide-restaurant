/**
 * LoadingSpinner - Reusable loading indicator
 */
function LoadingSpinner({ size = "medium", text = "Loading..." }) {
    const sizeClasses = {
        small: "w-4 h-4 border-2",
        medium: "w-8 h-8 border-3",
        large: "w-12 h-12 border-4",
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div
                className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
            ></div>
            {text && <p className="text-gray-600 text-sm">{text}</p>}
        </div>
    );
}

export default LoadingSpinner;
