import useGoTo from './useGoTo';

/**
 * 
 * @returns 
 */
const useGoToSignUp = () => {
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
    const goToSignUp = (direction: 'back'|'forward'|'none'|'root' = 'none',
        action: 'pop'|'push'|'replace' = 'push', showSpinner: boolean = false) => {

		goTo("/signup", direction, action, showSpinner);
	};
    return goToSignUp;
};

export default useGoToSignUp;
