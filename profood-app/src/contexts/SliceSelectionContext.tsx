import { createContext } from 'react';

import { SliceType } from './SliceType';

/**
 * Type definition for the SliceSelectionContext.
 * This unified context replaces both BoxTypeContext and CategoryContext.
 *
 * It manages slice selection state for both box types (with maximum limits)
 * and categories (without limits), reducing context duplication and improving performance.
 */
export type SliceSelectionContextType = {
    /**
     * Optional box type name for display purposes
     */
    boxTypeName: string;

    /**
     * Array of selected slices with their quantities
     */
    slices: SliceType[];

    /**
     * Total number of items selected (sum of all quantities)
     */
    totalNumber: number;

    /**
     * Maximum number of items allowed (0 means no limit)
     * Used for box types where there's a predefined capacity
     */
    maximumNumber: number;

    /**
     * Adds a slice to the selection or increments its quantity
     * @param item - The slice to add
     */
    add: (item: SliceType) => void;

    /**
     * Removes a slice or decrements its quantity
     * @param itemId - The id of the slice to remove
     */
    remove: (itemId: number) => void;

    /**
     * Clears all selected slices
     */
    clear: () => void;

    /**
     * Gets the quantity of a specific slice
     * @param itemId - The id of the slice to query
     * @returns The quantity, or 0 if not selected
     */
    getQuantity: (itemId: number) => number;

    /**
     * Sets the box type name
     * @param name - The name to set
     */
    setBoxTypeName: (name: string) => void;

    /**
     * Sets the maximum number of items allowed
     * @param max - The maximum number (0 for no limit)
     */
    setMaximumNumber: (max: number) => void;
};

/**
 * Create the unified slice selection context with default values.
 * This context provides state and handlers for managing slice selections
 * across both box type and category flows.
 */
const SliceSelectionContext = createContext<SliceSelectionContextType>({
    boxTypeName: '',
    slices: [],
    totalNumber: 0,
    maximumNumber: 0,
    add: () => {/* */},
    remove: () => {/* */},
    clear: () => {/* */},
    getQuantity: () => 0,
    setBoxTypeName: () => {/* */},
    setMaximumNumber: () => {/* */}
});

export default SliceSelectionContext;
