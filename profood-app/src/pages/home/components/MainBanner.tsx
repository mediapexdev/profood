import { IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonImg } from "@ionic/react";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";
import './MainBanner.css';
import { useTranslation } from "react-i18next";


/**
 * 
 * @returns 
 */
const MainBanner: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    return (
        <IonCard className="banner-widget main-banner-widget card">
            <div className="background-overlay"></div>
            <IonCardContent className="banner-widget-container card-container">
                <div className='banner-widget-content card-body d-flex flex-wrap justify-content-between align-items-center'>
                    <div className="banner-text">
                        <IonCardTitle className="card-title">{t('Le Goût, la Qualité, le Service')}</IonCardTitle>
                        {/* <span className='fs-1 mb-4'>Chez vous en <span className="highlighted">quelques clics !</span></span></h1> */}
                        <IonCardSubtitle className='card-subtitle'>{t('Chez vous en')} <span className="highlighted">{t('quelques clics !')}</span></IonCardSubtitle>
                        <IonCardSubtitle className='card-subtitle'>{t('Livraison dans toute la région de Dakar')}</IonCardSubtitle>
                    </div>
                    <div className='banner-image-wrapper d-flex flex-column-fluid align-items-center justify-content-center justify-content-md-end'>
                        {/* <img
                            className='banner-image img-fluid'
                            src={toAbsolutePublicUrl('/media/images/illustrations/scooter-livraison-Profood.png')}
                            alt=''
                        /> */}
                        <IonImg
                            className='banner-image img-fluid'
                            src={toAbsolutePublicUrl('/media/images/illustrations/scooter-livraison-Profood.png')}
                            alt=''
                        />
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default MainBanner;
