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
     * @param direction 
     * @param action 
     * @param showSpinner 
     */
    const goToHome = (direction: 'back'|'forward'|'none'|'root' = 'forward',
        action: 'pop'|'push'|'replace' = 'push', showSpinner: boolean = false) => {

		goTo("/views/home", direction, action, showSpinner);
	};
    return goToHome;
};

export default useGoToHome;
