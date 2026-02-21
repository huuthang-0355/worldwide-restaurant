import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "../../context/useToast";

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const STYLES = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
};

const ICON_STYLES = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
};

/**
 * ToastContainer - Renders toast notifications
 */
function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((toast) => {
                const Icon = ICONS[toast.type] || Info;
                return (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${STYLES[toast.type] || STYLES.info}`}
                    >
                        <Icon
                            className={`w-5 h-5 shrink-0 mt-0.5 ${ICON_STYLES[toast.type] || ICON_STYLES.info}`}
                        />
                        <p className="flex-1 text-sm font-medium">
                            {toast.message}
                        </p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default ToastContainer;
