import Card from "../ui/Card";

/**
 * StatCard - Reusable statistic display card
 * @param {string} label - Stat description
 * @param {string|number} value - Stat number
 * @param {ReactNode} icon - Icon element
 * @param {string} iconBg - Tailwind bg class for icon wrapper
 * @param {string} iconColor - Tailwind text class for icon
 */
function StatCard({
    label,
    value,
    icon,
    iconBg = "bg-gray-100",
    iconColor = "text-gray-600",
}) {
    return (
        <Card className="flex items-center gap-4">
            <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}
            >
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </Card>
    );
}

export default StatCard;
