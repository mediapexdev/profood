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
     * @param direction 
     * @param action 
     * @param showSpinner 
     */
    const goToSignIn = (direction: 'back'|'forward'|'none'|'root' = 'none',
        action: 'pop'|'push'|'replace' = 'push', showSpinner: boolean = false) => {

		goTo("/signin", direction, action, showSpinner);
	};
    return goToSignIn;
};

export default useGoToSignIn;
