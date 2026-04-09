import { createContext } from 'react';

/**
 * Type definition for the UIStateContext.
 * This unified context consolidates multiple UI-related contexts:
 * - TabsVisibilityContext
 * - SlicePriceVisibilityContext
 * - ConnectionReminderAlertContext
 *
 * Consolidation reduces provider nesting and improves performance.
 */
export type UIStateContextType = {
    /**
     * Tab bar visibility state
     */
    showTabs: boolean;
    setShowTabs: (show: boolean) => void;

    /**
     * Slice price visibility state
     */
    showSlicePrice: boolean;
    setShowSlicePrice: (show: boolean) => void;

    /**
     * Connection reminder alert state
     */
    canPresentConnectionAlert: boolean;
    setCanPresentConnectionAlert: (canPresent: boolean) => void;
    canDismissConnectionAlert: boolean;
    setCanDismissConnectionAlert: (canDismiss: boolean) => void;
};

/**
 * Create the unified UI state context with default values.
 * This context provides flags and setters for various UI states
 * throughout the application.
 */
const UIStateContext = createContext<UIStateContextType>({
    showTabs: true,
    setShowTabs: () => {/* */},

    showSlicePrice: false,
    setShowSlicePrice: () => {/* */},

    canPresentConnectionAlert: false,
    setCanPresentConnectionAlert: () => {/* */},
    canDismissConnectionAlert: false,
    setCanDismissConnectionAlert: () => {/* */}
});

export default UIStateContext;
