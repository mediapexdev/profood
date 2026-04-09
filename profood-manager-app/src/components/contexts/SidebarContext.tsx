import { createContext } from "react";

/**
 * Define the type for the context
 */
export type SidebarContextType = {
    showSidebar: boolean;
    setShowSidebar: (show: boolean) => void;
    toggleSidebar: () => void;
};

/**
 * Create the context
 */
const SidebarContext = createContext<SidebarContextType>({
    showSidebar: true,
    setShowSidebar: () => {/* */},
    toggleSidebar: () => {/* */}
});

export default SidebarContext;
