import React from 'react';

import { Form } from 'reactstrap';

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
        <Form
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
            <div className="d-flex flex-center">
                <p className={`font-${titleSize??'lg'} fw-semibold title-color text-wrap`}>{title}</p>
            </div>
            {/* end::Title */}
            {children}
        </Form>
    );
};

export default FormLayout;
