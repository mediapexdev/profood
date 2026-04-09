import { NavigateOptions } from 'react-router-dom';

import useGoTo from './useGoTo';

/**
 * 
 * @returns 
 */
const useGoToHome = () => {
    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     * @param options 
     * @param showSpinner 
     */
    const goToHome = (options?: NavigateOptions, showSpinner = false) => {

		goTo("/tableau-de-bord", options, showSpinner);
	};
    return goToHome;
};

export default useGoToHome;
