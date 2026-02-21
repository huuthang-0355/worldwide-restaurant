import { Search } from "lucide-react";

/**
 * SearchBar — rounded search input matching the customer mockup.
 */
function SearchBar({ value, onChange, placeholder = "Search menu items..." }) {
    return (
        <div className="px-5 py-3 bg-white">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full py-3 pl-10 pr-4 border-2 border-gray-200 rounded-full text-base outline-none focus:border-primary-500 transition-colors"
                />
            </div>
        </div>
    );
}

export default SearchBar;
