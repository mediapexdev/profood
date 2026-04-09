import useGoTo from './useGoTo';

/**
 * 
 * @returns 
 */
const useGoToCart = () => {
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
    const goToCart = (direction: 'back'|'forward'|'none'|'root' = 'forward',
        action: 'pop'|'push'|'replace' = 'push', showSpinner: boolean = false) => {

		goTo('/views/cart', direction, action, showSpinner);
	};
    return goToCart;
};

export default useGoToCart;
