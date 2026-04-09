import { createContext } from "react";

/**
 * Define the type for the context
 */
export type AlertContextType = {
    showAlert: boolean;
    text?: string;
    color: string;
    setShowAlert: (show: boolean) => void;
    setText: (text?: string) => void;
    setColor: (text: string) => void;
    toggleAlert: () => void;
};

/**
 * Create the context
 */
const AlertContext = createContext<AlertContextType>({
    showAlert: true,
    text: undefined,
    color: '',
    setShowAlert: () => {/* */},
    setColor: () => {/* */},
    setText: () => {/* */},
    toggleAlert: () => {/* */}
});

export default AlertContext;
