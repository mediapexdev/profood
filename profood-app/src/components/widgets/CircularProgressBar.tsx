import React from 'react';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';

import './CircularProgressBar.css';

/**
 * 
 */
export interface CircularProgressBarProps{
    // size : number;
    value: number;
    minValue: number;
    maxValue: number;
    showText: boolean;
    id?: string;
    className?: string;
}

/**
 * 
 * @param props 
 * @returns 
 */
const CircularProgressBar: React.FC<CircularProgressBarProps> = (props: CircularProgressBarProps) => {

    return (
        <CircularProgressbar
            value={props.value}
            minValue={props.minValue}
            maxValue={props.maxValue}
            text={!props.showText ? '' : `${props.value} / ${props.maxValue}`}
            className={props.className}
            styles={buildStyles({
                // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                strokeLinecap: 'butt',
            })}
        />
    );
};

export default CircularProgressBar;
