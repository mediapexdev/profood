import { createContext } from "react";

/**
 * Define the type for the context
 */
export type SlicePriceVisibilityContextType = {
    showPrice: boolean;
    setShowPrice: (show: boolean) => void;
};

/**
 * Create the context
 */
const SlicePriceVisibilityContext = createContext<SlicePriceVisibilityContextType>({
    showPrice: true,
    setShowPrice: () => {/* */}
});

export default SlicePriceVisibilityContext;
