import React, { useContext, useState } from "react";

import ViewsNavigationContext, { ViewsNavigationContextType } from "./ViewsNavigationContext";

/**
 * 
 */
interface Props {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useViewsNavigationContext = () => useContext(ViewsNavigationContext);

/**
 * Create the provider component
 *
 * @param param0 
 * @returns 
 */
const ViewsNavigationProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [currentViewIndex, setCurrentViewIndex] = useState<number>(1);

    /**
     * Define the context value
     */
    const contextValue: ViewsNavigationContextType = {
        currentViewIndex,
        setCurrentViewIndex
    };
    return <ViewsNavigationContext.Provider value={contextValue}>{children}</ViewsNavigationContext.Provider>;
};

export default ViewsNavigationProvider;
