import React, { useContext, useState } from "react";

import FullscreenModeContext, { FullscreenModeContextType } from "./FullscreenModeContext";

/**
 * 
 */
interface FullscreenModeProviderProps {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useFullscreenModeContext = () => useContext(FullscreenModeContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const FullscreenModeProvider: React.FC<FullscreenModeProviderProps> = ({ children }: FullscreenModeProviderProps) => {
    /**
     * 
     */
    const [fullscreenEnabled, setFullscreenEnabled] = useState<boolean>(false);

    /**
     *  Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet
     */
    const toggleFullsceenMode = () => {

        if(document.fullscreenEnabled){

            const element = document.documentElement;

            if(!fullscreenEnabled) {

                // if(element.requestFullscreen) {
                //     element.requestFullscreen();
                // }
                // else if(element.webkitRequestFullscreen) {     /* Safari */
                //     element.webkitRequestFullscreen();
                // }
                // else if(element.msRequestFullscreen) {         /* IE11 */
                //     element.msRequestFullscreen();
                // }
                element.requestFullscreen();
                setFullscreenEnabled(true);
                document.body.classList.add('fullscreen-enable');
            }
            else {
                // if(document.exitFullscreen) {
                //     document.exitFullscreen();
                // }
                // else if(document.mozCancelFullScreen) {
                //     document.mozCancelFullScreen();
                // }
                // else if(document.webkitExitFullscreen) {
                //     document.webkitExitFullscreen();
                // }
                document.exitFullscreen();
                setFullscreenEnabled(false);
                document.body.classList.remove('fullscreen-enable');
            }
        }
    };

    /**
     * The store object
     */
    const state: FullscreenModeContextType = {
        fullscreenEnabled,
        setFullscreenEnabled,
        toggleFullsceenMode
    };

    /**
     * Wrap the application in the provider with the initialized context
     */
    return <FullscreenModeContext.Provider value={state}>{children}</FullscreenModeContext.Provider>;
};

export default FullscreenModeProvider;
