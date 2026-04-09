import { NavigateOptions } from 'react-router-dom';

import useGoTo from './useGoTo';

/**
 * 
 * @returns 
 */
const useGoToSignIn = () => {
    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     * @param options 
     * @param showSpinner 
     */
    const goToSignIn = (options?: NavigateOptions, showSpinner = false) => {

		goTo("/connexion", options, showSpinner);
	};
    return goToSignIn;
};

export default useGoToSignIn;
