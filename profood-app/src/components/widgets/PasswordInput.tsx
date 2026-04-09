import React from 'react';

import { IonInput } from '@ionic/react';

import PasswordMeterControl from './PasswordMeterControl';

import './PasswordInput.css';

/**
 * 
 */
export interface PasswordMeterControlOptions{
    // checkUppercase: boolean; // true
    // checkLowercase: boolean; // true
    // checkDigit: boolean; // true
    // checkAlphanumeric: boolean; // true,
    className: string;
    id: string;
    inputId: string;
    minLength: number; // 8
}

/**
 * 
 */
export interface PasswordInputProps{
    className: string;
    fill: "outline" | "solid" | undefined;
    helperText?: string;
    id: string;
    label: string;
    labelPlacement: 'end' | 'fixed' | 'floating' | 'stacked' | 'start';
    meterControl: boolean;
    meterControlOptions: PasswordMeterControlOptions;
    value: string;
    handleValue: (value: string) => void;
}

/**
 * 
 * @param props 
 * @returns 
 */
const PasswordInput: React.FC<PasswordInputProps> = (props: PasswordInputProps) => {

    return (
        <div className="password-input">
            <IonInput
                id={props.id}
                type="password"
                label={props.label}
                labelPlacement={props.labelPlacement}
                aria-label={props.label}
                fill={props.fill}
                className={`${props.className} mb-2`}
                value={props.value}
                onIonInput={(e) => props.handleValue(e.target.value as string)}
            />
            {
                props.meterControl && <PasswordMeterControl inputValue={props.value} {...props.meterControlOptions} />
            }
            {
                props.helperText && <div className='helper-text d-flex'>{props.helperText}</div>
            }
        </div>
    );
};

export default PasswordInput;
