import { IonProgressBar} from "@ionic/react";

import './ProgressBar.css';

/**
 * 
 */
export interface ProgressBarProps {
    current_value: number;
    min_value: number;
    max_value: number;
};

/**
 * 
 * @param progressbar_props 
 * @returns 
 */
const ProgressBar: React.FC<ProgressBarProps> = (progressbar_props : ProgressBarProps) => {

    return (
        <IonProgressBar
            type="determinate"
            buffer={(progressbar_props.current_value / progressbar_props.max_value) + 0.05}
            // buffer={progressbar_props.max_value}
            value={progressbar_props.current_value / progressbar_props.max_value}
            min-value={progressbar_props.min_value}
            max-value={progressbar_props.max_value}
            className='progressbar-widget'
        ></IonProgressBar>
    );
};

export default ProgressBar;
