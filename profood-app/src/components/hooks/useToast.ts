import { useCallback } from 'react';

import { useIonToast } from '@ionic/react';
import { notifications } from 'ionicons/icons';

/**
 * 
 * @returns 
 */
const useToast = () => {
    /**
     * 
     */
    const [notify] = useIonToast();

    /**
     * 
     * @param msg 
     * @param duration 
     * @param position 
     */
    const showToast = useCallback((msg: string, duration: number = 1600, position: 'top'|'bottom'|'middle' = 'top') => {
        notify({
            message: msg,
            duration: duration,
            position: position,
            icon: notifications,
            translucent: true
        });
    }, []);
    return showToast;
};

export default useToast;
