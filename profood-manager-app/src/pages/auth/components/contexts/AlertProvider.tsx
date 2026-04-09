import React, { useContext, useEffect, useRef, useState } from "react";

import AlertContext, { AlertContextType } from "./AlertContext";

/**
 * 
 */
interface AlertProviderProps {
    children : React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useAlertContext = () => useContext(AlertContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const AlertProvider : React.FC<AlertProviderProps> = ({ children } : AlertProviderProps) => {
    /**
     * 
     */
    const [showAlert, setShowAlert] = useState<boolean>(false);

    /**
     * 
     */
    const [text, setText] = useState<string|undefined>(undefined);

    /**
     * 
     */
    const [color, setColor] = useState<string>('');

    /**
     * 
     */
    const toggleAlert = () => {
        setShowAlert(!showAlert);
    };

    /**
     * The store object
     */
    const state: AlertContextType = {
        showAlert,
        text,
        color,
        setShowAlert,
        setText,
        setColor,
        toggleAlert
    };

    /**
     * Wrap the application in the provider with the initialized context
     */
    return <AlertContext.Provider value={state}>{children}</AlertContext.Provider>;
};

export default AlertProvider;
