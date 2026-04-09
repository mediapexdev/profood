import { createContext } from 'react';

import { SliceType } from './SliceType';

/**
 * Define the type for the context
 */
export type BoxTypeContextType = {
    boxTypeName: string;
    maximumNumber: number;
    slices: SliceType[];
    totalNumber: number;
    add: (item: SliceType) => void;
    clear: () => void;
    getQuantity: (itemId: number) => number;
    remove: (itemId: number) => void;
    setBoxTypeName: (name: string) => void;
    setMaximumNumber: (max: number) => void;
};

/**
 * Create the context
 */
const BoxTypeContext = createContext<BoxTypeContextType>({
    boxTypeName: '',
    maximumNumber: 0,
    slices: [],
    totalNumber: 0,
    add: () => {/* */},
    clear: () => {/* */},
    getQuantity: () => 0,
    remove: () => {/* */},
    setBoxTypeName: () => {/* */},
    setMaximumNumber: () => {/* */}
});

export default BoxTypeContext;
