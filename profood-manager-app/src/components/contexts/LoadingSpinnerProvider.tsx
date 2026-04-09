import React, { useContext, useEffect, useRef, useState } from "react";

import LoadingSpinnerContext, { LoadingSpinnerContextType } from "./LoadingSpinnerContext";

/**
 * 
 */
interface LoadingSpinnerProviderProps {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useLoadingSpinnerContext = () => useContext(LoadingSpinnerContext);

/**
 * 
 * @param param0 
 * @returns 
 */
const LoadingSpinnerProvider: React.FC<LoadingSpinnerProviderProps> = ({ children }: LoadingSpinnerProviderProps) => {
    /**
     * 
     */
    const [showSpinner, setShowSpinner] = useState<boolean>(true);

    /**
     * 
     */
    const spinnerWrapper = useRef<HTMLElement|null>(null);

    /**
     * 
     */
    useEffect(() => {
        if(spinnerWrapper.current === null){
            spinnerWrapper.current = document.getElementById('spinnerWrapper');
        }   
        if(showSpinner){
            spinnerWrapper?.current?.classList.add('show');
        }
        else{
            spinnerWrapper?.current?.classList.remove('show');
        }
    }, [showSpinner]);

    /**
     * 
     * @param show 
     */
    // const setShowSpinner = (show : boolean) => {
    //     _setShowSpinner(show);
    // };

    /**
     * The store object
     */
    const state: LoadingSpinnerContextType = {
        showSpinner,
        setShowSpinner,
    };

    /**
     * Wrap the application in the provider with the initialized context
     */
    return <LoadingSpinnerContext.Provider value={state}>{children}</LoadingSpinnerContext.Provider>;
};

export default LoadingSpinnerProvider;
