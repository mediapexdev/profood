import React from 'react';

import {
    Button,
    Nav,
    NavItem
} from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { useViewsNavigationContext } from './contexts/ViewsNavigationProvider';

import './ViewsNavigation.css'

/**
 * 
 */
interface View {
    index: number;
    title: string;
}

/**
 * 
 * @returns 
 */
const ViewsNavigation: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const views: View[] = [
        {
            index: 1,
            title: t('Aperçu')
        },
        {
            index: 2,
            title: t('Edition')
        }
    ];

    /**
     * 
     */
    const { currentViewIndex, setCurrentViewIndex } = useViewsNavigationContext();

    /**
     * 
     */
    return(
        <div className='views-navigation-wrapper d-flex flex-row align-items-center mt-2'>
            <Nav className='views-navigation nav nav-underline'>
            {
                views.map((view, index) => {
                    return (
                        <NavItem key={index}>
                            <Button
                                tag='button'
                                type='button'
                                className={`title-color nav-link fw-medium fs-7 ${view.index === currentViewIndex ? 'active' : ''}`}
                                onClick={() => {
                                    if(view.index !== currentViewIndex){
                                        setCurrentViewIndex(view.index);
                                    }
                                }}
                            >
                                {view.title}
                            </Button>
                        </NavItem>
                    );
                })
            }
            </Nav>
        </div>
    );
};

export default ViewsNavigation;
