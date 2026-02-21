/**
 * Format a number as Vietnamese Dong (VND)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g. "125.000₫")
 */
export function formatVND(amount) {
    if (amount == null || isNaN(amount)) return "0₫";
    return amount.toLocaleString("vi-VN") + "₫";
}

/**
 * Format a number as Vietnamese Dong price (customer-facing format)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g. "450.000₫")
 */
export function formatPrice(amount) {
    if (amount == null || isNaN(amount)) return "0₫";
    return amount.toLocaleString("vi-VN") + "₫";
}

/**
 * Format a price adjustment (shows +/- sign)
 * @param {number} amount - The adjustment amount
 * @returns {string} Formatted string with sign (e.g. "+25.000₫")
 */
export function formatPriceAdjustment(amount) {
    if (amount == null || isNaN(amount) || amount === 0) return "+0₫";
    const sign = amount > 0 ? "+" : "";
    return sign + formatPrice(Math.abs(amount));
}
