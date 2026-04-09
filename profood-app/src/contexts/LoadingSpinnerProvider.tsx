import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

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
     * The store object
     * Memoize to prevent re-renders when showSpinner hasn't changed
     */
    const state: LoadingSpinnerContextType = useMemo(() => ({
        showSpinner,
        setShowSpinner,
    }), [showSpinner, setShowSpinner]);
    /**
     * Wrap the application in the provider with the initialized context
     */
    return <LoadingSpinnerContext.Provider value={state}>{children}</LoadingSpinnerContext.Provider>;
};

export default LoadingSpinnerProvider;
