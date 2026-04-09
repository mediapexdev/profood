import { createContext } from 'react';


/**
 * Define the type for the context
 */
export type ConnectionReminderAlertContextType = {
    canDismiss: boolean;
    canPresent: boolean;
    setCanDismiss: (can_dismiss: boolean) => void;
    setCanPresent: (can_present: boolean) => void;
};

/**
 * Create the context
 */
const ConnectionReminderAlertContext = createContext<ConnectionReminderAlertContextType>({
    canDismiss: false,
    canPresent: false,
    setCanDismiss: () => {/* */},
    setCanPresent: () => {/* */}
});

export default ConnectionReminderAlertContext;
