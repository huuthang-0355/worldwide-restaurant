import { Filter } from "lucide-react";
import Select from "../ui/Select";

/**
 * TableFilters - Filter bar for table list (status, location, sort)
 */
function TableFilters({ filters, onChange, locations = [] }) {
    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    const statusOptions = [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
    ];

    const sortOptions = [
        { value: "tableNumber", label: "Table Number" },
        { value: "capacity", label: "Capacity" },
        { value: "location", label: "Location" },
    ];

    const locationOptions = locations.map((loc) => ({
        value: loc,
        label: loc,
    }));

    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters:</span>
            </div>

            <Select
                placeholder="All Statuses"
                options={statusOptions}
                value={filters.status || ""}
                onChange={(e) => handleChange("status", e.target.value)}
                className="!w-40"
            />

            {locationOptions.length > 0 && (
                <Select
                    placeholder="All Locations"
                    options={locationOptions}
                    value={filters.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="!w-40"
                />
            )}

            <Select
                placeholder="Sort By"
                options={sortOptions}
                value={filters.sortBy || ""}
                onChange={(e) => handleChange("sortBy", e.target.value)}
                className="!w-40"
            />
        </div>
    );
}

export default TableFilters;
