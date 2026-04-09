import React, { useContext, useState } from "react";

import SlicePriceVisibilityContext, { SlicePriceVisibilityContextType } from "./SlicePriceVisibilityContext";

/**
 * 
 */
interface SlicePriceVisibilityProviderProps {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useSlicePriceVisibilityContext = () => useContext(SlicePriceVisibilityContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const SlicePriceVisibilityProvider: React.FC<SlicePriceVisibilityProviderProps> = ({ children }: SlicePriceVisibilityProviderProps) => {
    /**
     * 
     */
    const [showPrice, setShowPrice] = useState<boolean>(false);

    /**
     * The store object
     */
    const state: SlicePriceVisibilityContextType = {
        showPrice,
        setShowPrice,
    };

    /**
     * Wrap the application in the provider with the initialized context
     */
    return <SlicePriceVisibilityContext.Provider value={state}>{children}</SlicePriceVisibilityContext.Provider>;
};

export default SlicePriceVisibilityProvider;
