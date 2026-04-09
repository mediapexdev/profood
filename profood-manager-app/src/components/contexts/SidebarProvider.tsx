import React, { useContext, useState } from "react";

import SidebarContext, { SidebarContextType } from "./SidebarContext";

/**
 * 
 */
interface SidebarProviderProps {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useSidebarContext = () => useContext(SidebarContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }: SidebarProviderProps) => {
    /**
     * 
     */
    const [showSidebar, setShowSidebar] = useState<boolean>(false);

    /**
     * 
     */
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    /**
     * The store object
     */
    const state: SidebarContextType = {
        showSidebar,
        setShowSidebar,
        toggleSidebar
    };

    /**
     * Wrap the application in the provider with the initialized context
     */
    return <SidebarContext.Provider value={state}>{children}</SidebarContext.Provider>;
};

export default SidebarProvider;
