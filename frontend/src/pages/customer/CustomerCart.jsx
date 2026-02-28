import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/useSession";
import { useCustomerMenu } from "../../context/useCustomerMenu";
import { useToast } from "../../context/useToast";
import CartItemCard from "../../components/customer/CartItemCard";
import OrderSummary from "../../components/customer/OrderSummary";
import { formatPrice } from "../../utils/formatCurrency";
import {
    ShoppingCart,
    ArrowLeft,
    Loader2,
    Info,
    UtensilsCrossed,
} from "lucide-react";

/**
 * CustomerCart — full cart page matching the cart mockup.
 *
 * Sections: cart items list, special instructions, order summary,
 * info note, and a sticky "Place Order" bar.
 */
function CustomerCart() {
    const navigate = useNavigate();
    const { addSuccess, addError } = useToast();
    const { tableInfo } = useCustomerMenu();
    const {
        cartItems,
        cartTotal,
        cartLoading,
        loading,
        updateCartItem,
        removeCartItem,
        checkout,
    } = useSession();

    const [specialInstructions, setSpecialInstructions] = useState("");
    const [checkingOut, setCheckingOut] = useState(false);

    // Compute summary values
    const subtotal = cartTotal;
    const taxRate = 0.1;
    const taxAmount = Math.round(subtotal * taxRate);
    const total = subtotal + taxAmount;

    // ==================== Handlers ====================

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        try {
            await updateCartItem(itemId, { quantity: newQuantity });
        } catch {
            addError("Failed to update quantity");
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await removeCartItem(itemId);
            addSuccess("Item removed from cart");
        } catch {
            addError("Failed to remove item");
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        try {
            setCheckingOut(true);
            await checkout(specialInstructions || undefined);
            addSuccess("Order placed successfully!");
            setSpecialInstructions("");
            navigate("/menu/orders");
        } catch {
            addError("Failed to place order. Please try again.");
        } finally {
            setCheckingOut(false);
        }
    };

    const isLoading = cartLoading || loading || checkingOut;

    // ==================== Empty Cart ====================

    if (cartItems.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center min-h-96">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Your Cart is Empty
                </h2>
                <p className="text-gray-500 text-sm max-w-xs mb-6">
                    Browse the menu and add items to start your order.
                </p>
                <button
                    onClick={() => navigate("/menu/browse")}
                    className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-600 transition-colors"
                >
                    <UtensilsCrossed className="w-4 h-4 inline mr-2" />
                    Browse Menu
                </button>
            </div>
        );
    }

    // ==================== Render ====================

    return (
        <div className="pb-40">
            {/* Sub-header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                <button
                    onClick={() => navigate("/menu/browse")}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Your Cart</h1>
                <span className="ml-auto text-sm text-gray-500">
                    {tableInfo?.tableNumber || "Table"}
                </span>
            </div>

            {/* Cart Items */}
            <div className="px-4 py-3 space-y-3">
                {cartItems.map((item) => (
                    <CartItemCard
                        key={item.id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemove}
                        disabled={isLoading}
                    />
                ))}
            </div>

            {/* Special Instructions */}
            <div className="px-4 mt-2">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">
                    Special Instructions for Kitchen
                </h3>
                <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests for the entire order?"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
            </div>

            {/* Order Summary */}
            <div className="px-4 mt-4">
                <OrderSummary
                    subtotal={subtotal}
                    taxRate={taxRate}
                    taxAmount={taxAmount}
                    total={total}
                />
            </div>

            {/* Info Note */}
            <div className="mx-4 mt-4 bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                    <strong>Pay After Your Meal</strong>
                    <br />
                    You can place multiple orders during your visit. Payment
                    will be processed when you request the bill.
                </div>
            </div>

            {/* Sticky Place Order Bar */}
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-97.5 bg-white border-t border-gray-200 p-4 space-y-2 z-40">
                <button
                    onClick={handleCheckout}
                    disabled={isLoading || cartItems.length === 0}
                    className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {checkingOut ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Placing Order...
                        </>
                    ) : (
                        `Place Order – ${formatPrice(total)}`
                    )}
                </button>
                <button
                    onClick={() => navigate("/menu/browse")}
                    className="w-full py-3 rounded-xl font-semibold text-primary-500 border-2 border-primary-500 bg-transparent hover:bg-primary-50 transition-colors"
                >
                    Continue Browsing
                </button>
            </div>
        </div>
    );
}

export default CustomerCart;
