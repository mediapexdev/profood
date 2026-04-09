import React, { useContext, useMemo, useState } from 'react';

import UIStateContext, { UIStateContextType } from './UIStateContext';

/**
 * Props interface for the UIStateProvider component
 */
interface Props {
    children: React.ReactNode;
}

/**
 * Custom hook to access the UIStateContext
 * Provides access to UI state flags and their setters
 *
 * @returns UIStateContext value with UI state management
 */
export const useUIStateContext = () => useContext(UIStateContext);

/**
 * Unified UI state provider that consolidates multiple UI-related contexts:
 * - TabsVisibilityProvider: Controls bottom tab bar visibility
 * - SlicePriceVisibilityProvider: Toggles price display in slices
 * - ConnectionReminderAlertProvider: Manages connection reminder alert state
 *
 * By consolidating these simple boolean states into a single context,
 * we reduce provider nesting and improve performance by minimizing re-renders.
 *
 * @param {Props} props - Component props containing children
 * @returns Provider component wrapping children with UI state management
 */
const UIStateProvider: React.FC<Props> = ({ children }: Props) => {
    /**
     * Tab bar visibility state
     * Controls whether the bottom navigation tabs are shown
     */
    const [showTabs, setShowTabs] = useState<boolean>(true);

    /**
     * Slice price visibility state
     * Controls whether prices are displayed on slice components
     */
    const [showSlicePrice, setShowSlicePrice] = useState<boolean>(false);

    /**
     * Connection reminder alert state
     * Controls whether the connection reminder can be presented/dismissed
     */
    const [canPresentConnectionAlert, setCanPresentConnectionAlert] = useState<boolean>(false);
    const [canDismissConnectionAlert, setCanDismissConnectionAlert] = useState<boolean>(false);

    /**
     * Context value memoized to prevent unnecessary re-renders.
     * Only updates when the actual state values change.
     */
    const contextValue: UIStateContextType = useMemo(() => ({
        // Tab visibility
        showTabs,
        setShowTabs,

        // Slice price visibility
        showSlicePrice,
        setShowSlicePrice,

        // Connection reminder alert
        canPresentConnectionAlert,
        setCanPresentConnectionAlert,
        canDismissConnectionAlert,
        setCanDismissConnectionAlert
    }), [
        showTabs,
        showSlicePrice,
        canPresentConnectionAlert,
        canDismissConnectionAlert
    ]);

    return <UIStateContext.Provider value={contextValue}>{children}</UIStateContext.Provider>;
};

export default UIStateProvider;
