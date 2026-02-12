import { Search } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';

/**
 * MenuFilters - Filter bar for menu items
 */
function MenuFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  categories,
  statusOptions,
}) {
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const statusSelectOptions = [
    { value: '', label: 'All Status' },
    ...statusOptions,
  ];

  const sortOptions = [
    { value: 'newest', label: 'Sort by: Newest' },
    { value: 'name', label: 'Sort by: Name' },
    { value: 'price-low', label: 'Sort by: Price (Low)' },
    { value: 'price-high', label: 'Sort by: Price (High)' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-3">
      <div className="flex-1 min-w-50">
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        options={categoryOptions}
        placeholder="All Categories"
      />

      <Select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        options={statusSelectOptions}
        placeholder="All Status"
      />

      <Select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        options={sortOptions}
        placeholder="Sort by"
      />
    </div>
  );
}

export default MenuFilters;
