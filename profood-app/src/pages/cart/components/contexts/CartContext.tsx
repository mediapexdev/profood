import { createContext } from "react";

import { CartSliceProps } from "../slices/CartSlice";
import { BoxProps } from "../../../../components/box/BoxDetails";

/**
 * 
 */
export type CartContextType = {
    boxes: BoxProps[];
    slices: CartSliceProps[];
    totalBoxes: number;
    totalSlices: number;
    deleteBox:(box_id: number) => void;
    deleteSlice:(itemId: number) => void;
    fetchData: () => void;
    updateBoxes: (boxes: BoxProps[]) => void;
    updateSlices: (items: CartSliceProps[]) => void;
}

/**
 * Create the cart context
 */
const CartContext = createContext<CartContextType>({
    boxes: [],
    slices: [],
    totalBoxes: 0,
    totalSlices: 0,
    deleteBox: () => {/* */},
    deleteSlice: () => {/* */},
    fetchData: () => {/* */},
    updateBoxes: () => {/* */},
    updateSlices: () => {/* */}
});

export default CartContext;
