import { useCallback } from "react";

import { NavigateOptions, useNavigate } from "react-router-dom";

// import { useLoadingSpinnerContext } from '../../contexts/LoadingSpinnerProvider';

/**
 * 
 * @returns 
 */
const useGoTo = () => {
    /**
     * 
     */
    const navigate = useNavigate();

    /**
     * 
     */
    // const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     * @param to 
     * @param options 
     * @param showSpinner 
     */
    const goTo = useCallback((to : string, options?: NavigateOptions, showSpinner = false) => {

        // if(showSpinner){
        //     setShowSpinner(true);
        // }
		navigate(to, options);
	}, [navigate]);
    return goTo;
};

export default useGoTo;
