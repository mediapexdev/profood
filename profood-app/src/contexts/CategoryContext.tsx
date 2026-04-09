import { createContext } from 'react';

import { SliceType } from './SliceType';

/**
 * Define the type for the context
 */
export type CategoryContextType = {
    slices: SliceType[];
    totalNumber: number;
    add: (item: SliceType) => void;
    remove: (itemId: number) => void;
    clear: () => void;
    getQuantity: (itemId: number) => number;
};

/**
 * Create the context
 */
const CategoryContext = createContext<CategoryContextType>({
    slices: [],
    totalNumber: 0,
    add: () => {/* */},
    remove: () => {/* */},
    clear: () => {/* */},
    getQuantity: () => 0
});

export default CategoryContext;
