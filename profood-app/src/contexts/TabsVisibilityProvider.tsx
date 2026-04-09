import { useContext, useState } from "react";

import TabsVisibilityContext, { TabsVisibilityContextType } from "./TabsVisibilityContext";

/**
 * 
 */
interface TabsVisibilityProviderProps {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useTabsVisibilityContext = () => useContext(TabsVisibilityContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const TabsVisibilityProvider: React.FC<TabsVisibilityProviderProps> = ({ children }: TabsVisibilityProviderProps) => {
    /**
     * 
     */
    const [showTabs, setShowTabs] = useState<boolean>(true);

    /**
     * The store object
     */
    const state: TabsVisibilityContextType = {
        showTabs,
        setShowTabs,
    };

    /**
     * Wrap the application in the provider with the initialized context
     */
    return <TabsVisibilityContext.Provider value={state}>{children}</TabsVisibilityContext.Provider>;
};

export default TabsVisibilityProvider;
