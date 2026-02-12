import { useEffect } from "react";

/**
 * Modal - Reusable modal dialog component
 */
function Modal({ isOpen, onClose, title, children, size = "medium" }) {
    const sizeClasses = {
        small: "max-w-md",
        medium: "max-w-2xl",
        large: "max-w-4xl",
    };

    // Close modal on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div
                className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] flex flex-col`}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
            </div>
        </div>
    );
}

export default Modal;
