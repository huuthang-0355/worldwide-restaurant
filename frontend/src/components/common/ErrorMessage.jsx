/**
 * ErrorMessage - Reusable error display component
 */
function ErrorMessage({ message, onRetry }) {
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">
                        {message || "Something went wrong. Please try again."}
                    </p>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}

export default ErrorMessage;
