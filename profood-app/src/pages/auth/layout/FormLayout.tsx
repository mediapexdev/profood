import React from 'react';

import { IonLabel } from '@ionic/react';

import './FormLayout.css';

/**
 * 
 */
interface Props {
    children: React.ReactNode;
    title: string;
    titleSize?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    id?: string;
    className?: string;
    onSubmit?: () => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const FormLayout: React.FC<Props> = ({children, title, titleSize,
    id = undefined, className = undefined, onSubmit = undefined}: Props) => {

    return (
        <form
            id={id}
            className={`form w-100 ${className}`}
            onSubmit={(e) => {
                e.preventDefault();

                if(typeof onSubmit !== 'undefined'){
                    onSubmit();
                }
            }}
        >
            {/* begin::Title */}
            <div className="d-flex flex-center pt-2">
                <IonLabel className={`font-${titleSize??'lg'} fw-semibold title-color ion-text-wrap`}>{title}</IonLabel>
            </div>
            {/* end::Title */}
            {children}
        </form>
    );
};

export default FormLayout;
