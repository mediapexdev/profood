import React, { useContext } from 'react';

import {
    IonButtons,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon
} from '@ionic/react';
import { cartOutline, cartSharp } from 'ionicons/icons';

import ContentHeader from '../ContentHeader';
import { CurrentBoxTypeContext } from '../BoxTypeSlicesPage';
import useGoToCart from '../../../../components/hooks/useGoToCart';

import './Header.css';

/**
 * 
 * @returns 
 */
const Header: React.FC = () => {
    /**
     * 
     */
    const currentBoxType = useContext(CurrentBoxTypeContext);

    /**
     * 
     */
    const goToCart = useGoToCart();

    /**
     * 
     */
    return (
        <IonHeader
            translucent={true}
            className='box-type-slices-page-header'
        >
            {/* begin::Toolbar */}
            <IonToolbar>
                {/* begin::Back button */}
                <IonButtons slot="start">
                    <IonBackButton defaultHref='/'></IonBackButton>
                </IonButtons>
                {/* end::Back button */}

                {/* begin::Title */}
                <IonTitle className='title-color text-center'>{ currentBoxType && `Box ${currentBoxType.wording}`}</IonTitle>
                {/* end::Title */}

                {/* begin::Cart button */}
                <IonButtons slot="end">
                    <IonButton
                        type='button'
                        buttonType='button'
                        fill='clear'
                        slot='icon-only'
                        size='large'
                        shape='round'
                        className="btn-add-to-cart"
                        style={{minWidth: '48px', minHeight: '48px', margin: 0}}
                        onClick={() => goToCart()}
                    >
                        <IonIcon
                            md={cartSharp}
                            ios={cartOutline}
                            style={{fontSize: '1.2em'}}
                        />
                    </IonButton>
                </IonButtons>
                {/* end::Cart button */}
            </IonToolbar>
            {/* end::Toolbar */}
            {/* begin::Toolbar */}
            <IonToolbar>
                <ContentHeader />
            </IonToolbar>
            {/* end::Toolbar */}
        </IonHeader>
    );
};

export default Header;
