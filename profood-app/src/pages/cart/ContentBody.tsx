import React from "react";

import CartItemList from "./components/CartItemList";
import OrderSummary from "./components/order/OrderSummary";
import { useCartContext } from "./components/contexts/CartProvider";

import './ContentBody.css';

/**
 * Cart content body - unified view with single list and summary
 */
const ContentBody: React.FC = () => {
    const { boxes, slices } = useCartContext();
    const isEmpty = boxes.length === 0 && slices.length === 0;

    return (
        <div className="cart-content">
            {/* Unified cart items list */}
            <div className="cart-items-section">
                <CartItemList />
            </div>

            {/* Order summary - only show if cart has items */}
            {!isEmpty && (
                <div className="cart-summary-section">
                    <OrderSummary />
                </div>
            )}
        </div>
    );
};

export default ContentBody;
