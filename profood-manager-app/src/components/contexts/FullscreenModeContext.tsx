import { createContext } from "react";


/**
 * Define the type for the context
 */
export type FullscreenModeContextType = {
    fullscreenEnabled: boolean;
    setFullscreenEnabled: (enabled: boolean) => void;
    toggleFullsceenMode: () => void;
};

/**
 * Create the context
 */
const FullscreenModeContext = createContext<FullscreenModeContextType>({
    fullscreenEnabled: true,
    setFullscreenEnabled: () => {/* */},
    toggleFullsceenMode: () => {/* */}
});

export default FullscreenModeContext;
