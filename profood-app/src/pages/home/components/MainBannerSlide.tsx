import React from "react";

import { IonCard, IonCardContent, IonImg } from "@ionic/react";
import { Capacitor } from "@capacitor/core"

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper';

// import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";


import 'swiper/css';
import 'swiper/css/effect-cards';

import './MainBannerSlide.css';

/**
 * 
 * @returns 
 */
const MainBannerSlide: React.FC = () => {
    /**
     * 
     */
    // const { t } = useTranslation();

    /**
     * 
     */
    const data = (Capacitor.isNativePlatform()) ?
    [
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 1',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-1.jpg')
        },
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 3',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-5.jpg')
        },
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 2',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-3.png')
        },
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 3',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-2.jpg')
        }
    ] :
    [
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 1',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-1.jpg')
        },
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 3',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-5.jpg')
        },
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 2',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-3.png')
        },
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 3',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-4.jpg')
        },
        {
            // title: t('Le Goût, la Qualité, le Service'),
            // text: 'Text 3',
            image: toAbsolutePublicUrl('/media/images/banners/1920x1080-2.jpg')
        },
        
    ];

    return (
        <Swiper
            centeredSlides={true}
            grabCursor={true}
            // spaceBetween={8}
            loop={true}
            modules={[EffectCards]}
            effect={'cards'}
            cardsEffect={{
                slideShadows: false
            }}
            slidesPerView={'auto'}
            speed={400}
            autoplay={true}
        >
        {
            data.map((card, index) => {
                return (
                    <SwiperSlide
                        key={`slide_${index}`}
                        className="d-flex flex-center"
                    >
                        <IonCard className="banner-slide-widget main-banner-slide-widget card">
                            <IonCardContent className="banner-slide-widget-content card-body p-0">
                                <div className='banner-image-wrapper d-flex flex-column-fluid flex-center'>
                                    <IonImg
                                        className='banner-image img-fluid'
                                        src={card.image}
                                        alt='Illustration'
                                    />
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </SwiperSlide>
                )
            })
        }
        </Swiper>
    );
};

export default MainBannerSlide;
