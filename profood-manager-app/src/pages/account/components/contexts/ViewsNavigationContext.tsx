import { createContext } from "react";

/**
 * 
 */
export interface ViewsNavigationContextType {
    currentViewIndex: number;
    setCurrentViewIndex: (index: number) => void;
}

/**
 * Create the navigation context
*/
const ViewsNavigationContext = createContext<ViewsNavigationContextType>({
    currentViewIndex: 1,
    setCurrentViewIndex: () => {/* */}
});

export default ViewsNavigationContext;
