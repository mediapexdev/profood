import { useCallback } from "react";

import { toast, ToastOptions } from "react-toastify";

import 'react-toastify/dist/ReactToastify.min.css';

/**
 * 
 */
export type ToastType = 'info' | 'error' | 'success' | 'warning' | 'default';

/**
 * 
 * @returns 
 */
const useToast = () => {
    /**
     * 
     * @param message 
     */
    const showToast = useCallback((message : string, type?: ToastType, options?: ToastOptions) => {
        switch (type) {
            case 'info':
                toast.info(message, options);
                break;
            case 'error':
                toast.error(message, options);
                break;
            case 'success':
                toast.success(message, options);
                break;
            case 'warning':
                toast.warning(message, options);
                break;
            case 'default':
            default:
                toast.info(message, options);
                break;
        }
        // toast(message, options);
    }, []);
    return showToast;
};

export default useToast;
