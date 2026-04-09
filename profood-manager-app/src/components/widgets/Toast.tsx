import React from 'react';

import { ToastContainer } from "react-toastify";
import { ToastIcon } from 'react-toastify/dist/types';

import 'react-toastify/dist/ReactToastify.min.css';

import { useThemeModeContext } from '../contexts/ThemeModeProvider';

/**
 * 
 */
export type ToastPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';

/**
 * 
 */
export type ToastTheme = 'dark' | 'light' | 'colored';

/**
 * 
 */
export interface ToastProps {
    position?: ToastPosition; 
    autoClose?: number | false;
    hideProgressBar?: boolean;
    newestOnTop?: boolean;
    closeOnClick?: boolean;
    rtl?: boolean;
    pauseOnHover?: boolean;
    pauseOnFocusLoss?: boolean;
    draggable?: boolean;
    theme?: ToastTheme;
    className?: string;
    id?: string;
    icon?: ToastIcon;
}

/**
 * 
 * @param props 
 * @returns 
 */
const Toast: React.FC<ToastProps> = (props: ToastProps) => {
    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    return (
        <ToastContainer
            position={props.position??'top-right'}
            autoClose={props.autoClose??2400}
            hideProgressBar={props.hideProgressBar}
            newestOnTop={props.newestOnTop}
            closeOnClick={props.closeOnClick}
            rtl={props.rtl}
            pauseOnHover={props.pauseOnHover}
            pauseOnFocusLoss={props.pauseOnFocusLoss}
            draggable={props.draggable}
            theme={props.theme??themeMode === 'dark' ? 'light' : 'dark'}
            className={props.className}
            containerId={props.id}
            icon={props.icon}
        />
    );
};

export default Toast;
