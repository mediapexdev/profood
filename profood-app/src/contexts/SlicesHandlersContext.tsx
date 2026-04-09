import { createContext } from 'react';

import { SliceType } from './SliceType';

/**
 * Define the type for the context
 */
export type SlicesHandlersContextType = {
    add: (item: SliceType) => void;
    remove: (itemId: number) => void;
    getQuantity: (itemId: number) => number;
};

/**
 * Create the context
 */
const SlicesHandlersContext = createContext<SlicesHandlersContextType>({
    add: () => {/* */},
    remove: () => {/* */},
    getQuantity: () => 0
});

export default SlicesHandlersContext;