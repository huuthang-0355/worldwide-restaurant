/**
 * ConfirmDialog - Reusable confirmation dialog
 */
function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
}) {
    if (!isOpen) return null;

    const variantClasses = {
        danger: "bg-red-600 hover:bg-red-700",
        primary: "bg-blue-600 hover:bg-blue-700",
        success: "bg-green-600 hover:bg-green-700",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            ></div>

            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-white rounded transition-colors ${variantClasses[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
