import { useIonRouter } from '@ionic/react';

import { useLoadingSpinnerContext } from '../../contexts/LoadingSpinnerProvider';

/**
 * 
 * @returns 
 */
const useGoTo = () => {
    /**
     * 
     */
    const router = useIonRouter();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     * @param to 
     * @param direction 
     * @param action 
     * @param showSpinner 
     */
    const goTo = (to: string, direction: 'back'|'forward'|'none'|'root' = 'forward',
        action: 'pop'|'push'|'replace' = 'push', showSpinner: boolean = false) => {

        if(showSpinner){
            setShowSpinner(true);
        }
		router.push(to, direction, action);
	};
    return goTo;
};

export default useGoTo;
