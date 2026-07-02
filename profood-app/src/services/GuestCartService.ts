import { BoxTypeProps } from "../components/box/BoxType";
import { SliceProps } from "../components/slices/Slice";
import { BoxSliceProps } from "../components/box/slices/BoxSlice";

/**
 * Constant for localStorage key used to store guest cart data
 */
const GUEST_CART_KEY = 'profood_guest_cart';

/**
 * Time-to-live for guest cart in milliseconds (7 days)
 */
const CART_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Interface for a box in the guest cart
 * Mirrors the structure of server-side Box model but optimized for localStorage
 */
export interface GuestCartBox {
    box_type_id: number;
    box_type: BoxTypeProps; // BoxType data for display
    slices: Array<{
        slice_id: number;
        quantity: number;
        slice: SliceProps;
    }>;
    added_at: number; // Timestamp when box was added
}

/**
 * Interface for individual slices in the guest cart
 * Represents standalone slices not part of a box
 */
export interface GuestCartSlice {
    slice_id: number;
    slice: SliceProps; // Slice data for display
    quantity: number;
    added_at: number; // Timestamp when slice was added
}

/**
 * Main guest cart structure stored in localStorage
 */
export interface GuestCart {
    boxes: GuestCartBox[];
    slices: GuestCartSlice[];
    updated_at: number; // Last modification timestamp for TTL checking
}

/**
 * Retrieves the guest cart from localStorage
 * Returns empty cart structure if none exists or if cart is expired
 *
 * @returns {GuestCart} The guest cart object
 */
export const getGuestCart = (): GuestCart => {
    try {
        const cartData = localStorage.getItem(GUEST_CART_KEY);

        if (!cartData) {
            return createEmptyCart();
        }

        const cart: GuestCart = JSON.parse(cartData);

        // Check if cart is expired (older than 7 days)
        if (isGuestCartExpired()) {
            clearGuestCart();
            return createEmptyCart();
        }

        return cart;
    } catch (error) {
        console.error('Error reading guest cart from localStorage:', error);
        return createEmptyCart();
    }
};

/**
 * Event fired on window after every guest-cart mutation, so that
 * components mirroring the cart in React state (quantity steppers,
 * cart badges, ...) can re-sync — several pages stay mounted at once
 * under Ionic's router outlet and would otherwise go stale.
 */
export const GUEST_CART_CHANGED_EVENT = 'guest-cart:changed';

const notifyGuestCartChanged = (): void => {
    window.dispatchEvent(new CustomEvent(GUEST_CART_CHANGED_EVENT));
};

/**
 * Saves the guest cart to localStorage
 * Updates the updated_at timestamp automatically
 *
 * @param {GuestCart} cart - The cart object to save
 */
export const saveGuestCart = (cart: GuestCart): void => {
    try {
        cart.updated_at = Date.now();
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
        notifyGuestCartChanged();
    } catch (error) {
        console.error('Error saving guest cart to localStorage:', error);
    }
};

/**
 * Adds a box with its slices to the guest cart
 * Creates a new box entry with all associated slice data
 *
 * @param {BoxTypeProps} boxType - The box type being added
 * @param {BoxSliceProps[]} boxSlices - Array of slices included in this box
 */
export const addBoxToGuestCart = (boxType: BoxTypeProps, boxSlices: BoxSliceProps[]): void => {
    const cart = getGuestCart();

    // Transform BoxSliceProps to the format needed for GuestCartBox
    const slices = boxSlices.map(boxSlice => ({
        slice_id: boxSlice.slice.id,
        quantity: boxSlice.quantity,
        slice: boxSlice.slice
    }));

    const newBox: GuestCartBox = {
        box_type_id: boxType.id,
        box_type: boxType,
        slices: slices,
        added_at: Date.now()
    };

    cart.boxes.push(newBox);
    saveGuestCart(cart);
};

/**
 * Simple slice selection type from SliceSelectionContext
 */
interface SliceSelection {
    id: number;
    quantity: number;
    slice?: SliceProps;
}

/**
 * Adds a box with slice selections to the guest cart
 * This version accepts the simpler format from SliceSelectionContext
 *
 * @param {BoxTypeProps} boxType - The box type being added
 * @param {SliceSelection[]} sliceSelections - Array of slice selections with id and quantity
 */
export const addBoxToGuestCartFromSelection = (
    boxType: BoxTypeProps,
    sliceSelections: SliceSelection[]
): void => {
    const cart = getGuestCart();

    // Filter only slices with quantity > 0 and transform to storage format
    const slices = sliceSelections
        .filter(s => s.quantity > 0 && s.slice)
        .map(s => ({
            slice_id: s.id,
            quantity: s.quantity,
            slice: s.slice as SliceProps
        }));

    const newBox: GuestCartBox = {
        box_type_id: boxType.id,
        box_type: boxType,
        slices: slices,
        added_at: Date.now()
    };

    cart.boxes.push(newBox);
    saveGuestCart(cart);
};

/**
 * Adds or updates a standalone slice in the guest cart
 * If the slice already exists, increases its quantity
 * If it doesn't exist, creates a new entry
 *
 * @param {SliceProps} slice - The slice being added
 * @param {number} quantity - The quantity to add (defaults to 1)
 */
export const addSliceToGuestCart = (slice: SliceProps, quantity: number = 1): void => {
    const cart = getGuestCart();

    // Check if slice already exists in cart
    const existingSliceIndex = cart.slices.findIndex(
        cartSlice => cartSlice.slice_id === slice.id
    );

    if (existingSliceIndex !== -1) {
        // Update existing slice quantity
        cart.slices[existingSliceIndex].quantity += quantity;
        cart.slices[existingSliceIndex].added_at = Date.now();
    } else {
        // Add new slice
        const newSlice: GuestCartSlice = {
            slice_id: slice.id,
            slice: slice,
            quantity: quantity,
            added_at: Date.now()
        };
        cart.slices.push(newSlice);
    }

    saveGuestCart(cart);
};

/**
 * Removes a box from the guest cart by its index
 * Uses index rather than ID since guest cart boxes don't have server-side IDs
 *
 * @param {number} index - The index of the box to remove
 */
export const removeBoxFromGuestCart = (index: number): void => {
    const cart = getGuestCart();

    if (index >= 0 && index < cart.boxes.length) {
        cart.boxes.splice(index, 1);
        saveGuestCart(cart);
    }
};

/**
 * Removes a standalone slice from the guest cart
 *
 * @param {number} sliceId - The ID of the slice to remove
 */
export const removeSliceFromGuestCart = (sliceId: number): void => {
    const cart = getGuestCart();

    cart.slices = cart.slices.filter(cartSlice => cartSlice.slice_id !== sliceId);
    saveGuestCart(cart);
};

/**
 * Completely clears the guest cart from localStorage
 */
export const clearGuestCart = (): void => {
    try {
        localStorage.removeItem(GUEST_CART_KEY);
        notifyGuestCartChanged();
    } catch (error) {
        console.error('Error clearing guest cart from localStorage:', error);
    }
};

/**
 * Calculates the total number of items in the guest cart
 * Counts both boxes and individual slices
 *
 * @returns {number} Total count of items in cart
 */
export const getGuestCartCount = (): number => {
    const cart = getGuestCart();
    return cart.boxes.length + cart.slices.length;
};

/**
 * Checks if the guest cart has exceeded its time-to-live (7 days)
 *
 * @returns {boolean} True if cart is expired, false otherwise
 */
export const isGuestCartExpired = (): boolean => {
    try {
        const cartData = localStorage.getItem(GUEST_CART_KEY);

        if (!cartData) {
            return false; // No cart means not expired
        }

        const cart: GuestCart = JSON.parse(cartData);
        const now = Date.now();
        const age = now - cart.updated_at;

        return age > CART_TTL;
    } catch (error) {
        console.error('Error checking guest cart expiration:', error);
        return true; // Treat errors as expired to trigger cleanup
    }
};

/**
 * Creates an empty guest cart structure
 * Helper function to ensure consistent initialization
 *
 * @returns {GuestCart} An empty guest cart object
 */
const createEmptyCart = (): GuestCart => {
    return {
        boxes: [],
        slices: [],
        updated_at: Date.now()
    };
};
