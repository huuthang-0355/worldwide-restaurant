/**
 * CategoryTabs — horizontal scrollable category filter tabs.
 * Includes an "All" option, followed by categories from the API response.
 */
function CategoryTabs({ categories = [], activeId, onChange }) {
    return (
        <div className="flex gap-2.5 px-5 py-2.5 overflow-x-auto bg-white scrollbar-hide">
            {/* "All" tab */}
            <button
                onClick={() => onChange(null)}
                className={`px-5 py-2 rounded-full border-none text-sm cursor-pointer whitespace-nowrap transition-colors ${
                    !activeId
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
                All
            </button>

            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onChange(cat.id)}
                    className={`px-5 py-2 rounded-full border-none text-sm cursor-pointer whitespace-nowrap transition-colors ${
                        activeId === cat.id
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}

export default CategoryTabs;
