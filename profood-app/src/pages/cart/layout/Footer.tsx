import { IonToolbar, IonFooter } from '@ionic/react';

import Navigation from './Navigation';

import './Footer.css';


/**
 * 
 * @returns 
 */
const Footer: React.FC = () => {
    /**
     * 
     */
    return (
        <IonFooter
            translucent={true}
            className='cart-page-footer'
        >
            <IonToolbar>
                <Navigation />
            </IonToolbar>
        </IonFooter>
    );
};

export default Footer;
