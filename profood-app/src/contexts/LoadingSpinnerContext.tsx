import { createContext } from "react";

/**
 * Define the type for the context
 */
export type LoadingSpinnerContextType = {
    showSpinner: boolean;
    setShowSpinner: (show: boolean) => void;
};

/**
 * Create the context
 */
const LoadingSpinnerContext = createContext<LoadingSpinnerContextType>({
    showSpinner: true,
    setShowSpinner: () => {/* */}
});

export default LoadingSpinnerContext;
