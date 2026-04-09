import React, { useContext, useState } from 'react';

import ConnectionReminderAlertContext, { ConnectionReminderAlertContextType } from './ConnectionReminderAlertContext';

/**
 * 
 */
interface Props {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useConnectionReminderAlertContext = () => useContext(ConnectionReminderAlertContext);

/**
 * Create the provider component
 * 
 * @param param0 
 * @returns 
 */
const ConnectionReminderAlertProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [canDismiss, setCanDismiss] = useState<boolean>(false);
    const [canPresent, setCanPresent] = useState<boolean>(false);

    /**
     * Define the context value
     */
    const contextValue: ConnectionReminderAlertContextType = {
        canDismiss,
        canPresent,
        setCanDismiss,
        setCanPresent
    };
    return <ConnectionReminderAlertContext.Provider value={contextValue}>{children}</ConnectionReminderAlertContext.Provider>;
};

export default ConnectionReminderAlertProvider;
