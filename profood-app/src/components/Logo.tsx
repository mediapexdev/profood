import React from 'react';

import { IonImg } from '@ionic/react';

import { toAbsolutePublicUrl } from '../helpers/AssetHelpers';

/**
 * 
 * @returns 
 */
const Logo: React.FC = () => {
    /**
     * 
     */
    return (
        <div className="logo">
            <IonImg
                className="logo-image"
                src={toAbsolutePublicUrl('/media/images/logos/profood-new.png')}
                alt="Logo"
            />
        </div>
    );
};

export default Logo;
