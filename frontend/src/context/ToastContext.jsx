import { createContext, useState, useCallback, useRef } from "react";

export const ToastContext = createContext();

/**
 * ToastProvider - Provides toast notification state and actions
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (message, type = "info", duration = 5000) => {
            const id = ++toastIdRef.current;
            const toast = { id, message, type, duration };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast],
    );

    const success = useCallback(
        (message, duration) => addToast(message, "success", duration),
        [addToast],
    );

    const error = useCallback(
        (message, duration) => addToast(message, "error", duration),
        [addToast],
    );

    const warning = useCallback(
        (message, duration) => addToast(message, "warning", duration),
        [addToast],
    );

    const info = useCallback(
        (message, duration) => addToast(message, "info", duration),
        [addToast],
    );

    return (
        <ToastContext.Provider
            value={{
                toasts,
                addToast,
                removeToast,
                success,
                error,
                warning,
                info,
            }}
        >
            {children}
        </ToastContext.Provider>
    );
}
