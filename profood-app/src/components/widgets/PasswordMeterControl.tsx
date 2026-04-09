import React, { useCallback, useEffect, useRef, useState } from 'react';

import './PasswordMeterControl.css';

/**
 * 
 */
export interface PasswordMeterControlProps{
    // checkUppercase: boolean; // true
    // checkLowercase: boolean; // true
    // checkDigit: boolean; // true
    // checkAlphanumeric: boolean; // true,
    className?: string;
    id?: string;
    inputId: string;
    inputValue: string;
    minLength: number; // 8
}

/**
 * 
 * @param props 
 * @returns 
 */
const PasswordMeterControl: React.FC<PasswordMeterControlProps> = (props: PasswordMeterControlProps) => {
    /**
     * 
     */
    const [strength, setStrength] = useState<number>(0);

    /**
     * 
     */
    const inputElement = useRef<Element|null>(null);

    /**
     * 
     */
    useEffect(() => {
        if(inputElement.current === null){
            inputElement.current = document.getElementById(props.inputId);
        }
    }, []);

    /**
     * 
     * @returns 
     */
    const confirmRequiredLength = useCallback(() => props.inputValue.length >= props.minLength, [props.inputValue.length, props.minLength]);

    /**
     * 
     * @returns 
     */
    const containsAlphanumeric = useCallback(() => /[~`!#@$%^&*+=\-[\]\\';,/{}|\\":<>?]/g.test(props.inputValue), [props.inputValue]);

    /**
     * 
     * @returns 
     */
    const containsDigits = useCallback(() => /[0-9]/.test(props.inputValue), [props.inputValue]);

    /**
     * 
     * @returns 
     */
    const containsLowercase = useCallback(() => /[a-z]/.test(props.inputValue), [props.inputValue]);

    /**
     * 
     * @returns 
     */
    const containsUppercase = useCallback(() => /[A-Z]/.test(props.inputValue), [props.inputValue]);

    /**
     * 
     */
    useEffect(() => {
        let _strength = 0;

        if(props.inputValue.length){
            if(confirmRequiredLength()){
                _strength += 20;
            }
            if(containsAlphanumeric()){
                _strength += 20;
            }
            if(containsDigits()){
                _strength += 20;
            }
            if(containsLowercase()){
                _strength += 20;
            }
            if(containsUppercase()){
                _strength += 20;
            }
        }
        setStrength(_strength);
    }, [confirmRequiredLength, containsAlphanumeric, containsDigits, containsLowercase, containsUppercase, props.inputValue]);

    return (
        <div
            id={props.id}
            className={`password-meter-control d-flex align-items-center ${props.className}`}
        >
            <div className={`password-meter-control-element h-5px me-2 ${strength >= 20 ? 'active' : ''}`}></div>
            <div className={`password-meter-control-element h-5px me-2 ${strength >= 40 ? 'active' : ''}`}></div>
            <div className={`password-meter-control-element h-5px me-2 ${strength >= 60 ? 'active' : ''}`}></div>
            <div className={`password-meter-control-element h-5px ${strength >= 100 ? 'active' : ''}`}></div>
        </div>
    );
};

export default PasswordMeterControl;
