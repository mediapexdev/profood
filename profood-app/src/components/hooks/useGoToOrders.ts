import useGoTo from './useGoTo';

/**
 * 
 * @returns 
 */
const useGoToOrders = () => {
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
    const goToOrders = (direction: 'back'|'forward'|'none'|'root' = 'forward',
        action: 'pop'|'push'|'replace' = 'push', showSpinner: boolean = false) => {

		goTo("/views/orders", direction, action, showSpinner);
	};
    return goToOrders;
};

export default useGoToOrders;
