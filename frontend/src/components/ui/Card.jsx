/**
 * Card - Reusable card container component
 */
function Card({ children, className = "", padding = true, hover = false }) {
    return (
        <div
            className={`bg-white rounded-lg shadow border border-gray-200 ${
                padding ? "p-4" : ""
            } ${hover ? "hover:shadow-lg transition-shadow" : ""} ${className}`}
        >
            {children}
        </div>
    );
}

export default Card;
