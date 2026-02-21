import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import SearchBar from "../../components/customer/SearchBar";
import CategoryTabs from "../../components/customer/CategoryTabs";
import MenuItemCard from "../../components/customer/MenuItemCard";
import { Loader2 } from "lucide-react";

/**
 * CustomerMenu — main menu browsing page.
 *
 * Renders SearchBar, CategoryTabs, and a list of MenuItemCards.
 * Supports search, category filtering, and pagination.
 */
function CustomerMenu() {
    const navigate = useNavigate();
    const {
        sessionValid,
        categories,
        items,
        pagination,
        loading,
        error,
        fetchMenuItems,
    } = useCustomerMenu();

    // ==================== Local Filter State ====================
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Redirect to landing if session isn't valid
    useEffect(() => {
        if (!sessionValid) {
            navigate("/menu", { replace: true });
        }
    }, [sessionValid, navigate]);

    // Debounce search input (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch items whenever filters change
    const loadItems = useCallback(() => {
        const params = {};
        if (debouncedQuery) params.query = debouncedQuery;
        if (activeCategory) params.categoryId = activeCategory;
        params.page = 1;
        fetchMenuItems(params);
    }, [debouncedQuery, activeCategory, fetchMenuItems]);

    useEffect(() => {
        if (sessionValid) {
            loadItems();
        }
    }, [sessionValid, loadItems]);

    // Pagination handler
    const handleLoadMore = () => {
        if (!pagination.hasNext || loading) return;
        const params = { page: pagination.page + 1 };
        if (debouncedQuery) params.query = debouncedQuery;
        if (activeCategory) params.categoryId = activeCategory;
        fetchMenuItems(params);
    };

    const handleCategoryChange = (catId) => {
        setActiveCategory(catId);
    };

    return (
        <div>
            {/* Search */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {/* Category filter */}
            <CategoryTabs
                categories={categories}
                activeId={activeCategory}
                onChange={handleCategoryChange}
            />

            {/* Menu list */}
            <div className="px-5 py-2 space-y-3">
                {/* Loading state (initial) */}
                {loading && items.length === 0 && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="text-center py-10">
                        <p className="text-red-500 mb-3">{error}</p>
                        <button
                            onClick={loadItems}
                            className="px-5 py-2 bg-primary-500 text-white rounded-full text-sm hover:bg-primary-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-5xl mb-3">🍽️</p>
                        <p className="text-gray-500">No items found</p>
                    </div>
                )}

                {/* Items */}
                {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                ))}

                {/* Load more */}
                {pagination.hasNext && (
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="w-full py-3 text-center text-primary-500 font-medium hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? "Loading…" : "Load more"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default CustomerMenu;
