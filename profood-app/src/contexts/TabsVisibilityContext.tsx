import { createContext } from "react";

/**
 * Define the type for the context
 */
export type TabsVisibilityContextType = {
    showTabs: boolean;
    setShowTabs: (show: boolean) => void;
};

/**
 * Create the context
 */
const TabsVisibilityContext = createContext<TabsVisibilityContextType>({
    showTabs: true,
    setShowTabs: () => {/* */}
});

export default TabsVisibilityContext;
