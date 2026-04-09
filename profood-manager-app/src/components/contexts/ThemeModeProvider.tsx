import React, { useContext, useEffect, useState } from "react";

import ThemeModeContext, { ThemeModeContextType } from "./ThemeModeContext";

/**
 * 
 */
interface ThemeModeProviderProps {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useThemeModeContext = () => useContext(ThemeModeContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }: ThemeModeProviderProps) => {
    /**
     * 
     */
    const [themeMode, setThemeMode] = useState<'dark'|'light'>('light');

    /**
     * 
     */
    useEffect(() => {
        setThemeMode(localStorage.getItem('mp_theme_mode_value') === 'dark' ? 'dark' : 'light');
    }, []);

    /**
     * The store object
     */
    const state: ThemeModeContextType = {
        themeMode,
        setThemeMode,
    };

    /**
     * Wrap the application in the provider with the initialized context
     */
    return <ThemeModeContext.Provider value={state}>{children}</ThemeModeContext.Provider>;
};

export default ThemeModeProvider;
