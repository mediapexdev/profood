import { createContext } from "react";

/**
 * Define the type for the context
 */
export type ThemeModeContextType = {
    themeMode: 'dark' | 'light';
    setThemeMode: (mode: 'dark' | 'light') => void;
};

/**
 * Create the context
 */
const ThemeModeContext = createContext<ThemeModeContextType>({
    themeMode: 'light',
    setThemeMode: () => {/* */}
});

export default ThemeModeContext;
