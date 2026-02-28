import { Check } from "lucide-react";

/**
 * OrderProgressBar — visual step indicator for order status.
 *
 * Steps: Received → Preparing → Ready
 * Maps API statuses: PENDING/IN_KITCHEN = Received, PREPARING = Preparing, READY/SERVED/COMPLETED = Ready
 */
const STEPS = ["Received", "Preparing", "Ready"];

const STATUS_TO_STEP = {
    PENDING: 0,
    IN_KITCHEN: 0,
    PREPARING: 1,
    READY: 2,
    SERVED: 2,
    COMPLETED: 2,
};

function OrderProgressBar({ status }) {
    const currentStep = STATUS_TO_STEP[status] ?? 0;
    const isCompleted = status === "READY" || status === "SERVED" || status === "COMPLETED";

    return (
        <div className="flex items-center justify-between my-4">
            {STEPS.map((label, index) => {
                const isDone = index < currentStep || (index === currentStep && isCompleted);
                const isActive = index === currentStep && !isCompleted;

                return (
                    <div key={label} className="flex items-center flex-1 last:flex-initial">
                        {/* Step */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                    isDone
                                        ? "bg-green-500 border-green-500 text-white"
                                        : isActive
                                          ? "bg-primary-500 border-primary-500 text-white animate-pulse"
                                          : "bg-gray-100 border-gray-300 text-gray-400"
                                }`}
                            >
                                {isDone ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span
                                className={`text-xs mt-1 ${
                                    isDone || isActive
                                        ? "text-gray-700 font-medium"
                                        : "text-gray-400"
                                }`}
                            >
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < STEPS.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 mx-2 mt-[-16px] ${
                                    index < currentStep || (isDone && index < STEPS.length - 1)
                                        ? "bg-green-500"
                                        : "bg-gray-200"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default OrderProgressBar;
