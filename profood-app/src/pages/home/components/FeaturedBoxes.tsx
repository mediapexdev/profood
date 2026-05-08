import React, { useCallback } from 'react';

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonImg,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';

import { BoxTypeProps } from '../../../components/box/BoxType';
import PriceDisplay from '../../../components/price/PriceDisplay';
import useGoTo from '../../../components/hooks/useGoTo';
import { useLoadingSpinnerContext } from '../../../contexts/LoadingSpinnerProvider';

import 'swiper/css';
// Swiper 8 bundles pagination CSS inside the core bundle; the separate
// 'swiper/css/pagination' path does not exist in this version.
import './FeaturedBoxes.css';

/**
 * Props for FeaturedBoxes.
 *
 * `boxes` comes from DataContext.boxTypesProps and may be an empty
 * array while loading (the parent DataProvider initialises it that
 * way before the API responds).
 */
interface FeaturedBoxesProps {
    boxes: BoxTypeProps[];
}

/**
 * FeaturedBoxes — horizontal Swiper carousel of Box types.
 *
 * Dynamic: renders from DataContext.boxTypesProps (passed as props by
 * HomePage).  Shows skeleton cards while the array is empty to
 * prevent cumulative layout shift.
 *
 * Navigation: tapping a card's "Composer" button navigates to
 * /slices/typeBox/:id so the user can fill the selected Box.
 */
const FeaturedBoxes: React.FC<FeaturedBoxesProps> = ({ boxes }) => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const { setShowSpinner } = useLoadingSpinnerContext();

    const handleNavigate = useCallback((id: number) => {
        setShowSpinner(true);
        setTimeout(() => setShowSpinner(false), 1000);
        goTo(`/slices/typeBox/${id}`, 'none', 'push');
    }, [goTo, setShowSpinner]);

    /** Show skeleton cards while data has not arrived yet */
    const isLoading = boxes.length === 0;

    /**
     * We cap the featured carousel at 6 items so it doesn't become
     * overwhelming.  The full list is accessible via /box-types/.
     */
    const displayedBoxes = boxes.slice(0, 6);

    return (
        <section className="featured-boxes-section home-section" aria-label={t('Acheter un Box')}>
            {/* Section header with "see all" link */}
            <div className="featured-boxes-header">
                <h2 className="featured-boxes-heading">{t('Acheter un Box')}</h2>
                <IonButton
                    fill="clear"
                    size="small"
                    color="primary"
                    className="featured-boxes-see-all"
                    routerLink="/box-types/"
                    aria-label={t('Voir tout')}
                >
                    {t('Voir tout')}
                </IonButton>
            </div>

            {/* Box concept explainer — one-liner */}
            <p className="featured-boxes-explainer">
                {t("Qu'est-ce qu'un Box ?")} —&nbsp;
                <span className="featured-boxes-explainer-detail">
                    {t('Un Box est un panier de viande à prix fixe que vous composez vous-même. Choisissez parmi nos découpes de bœuf, mouton et volaille jusqu\'à remplir votre Box !')}
                </span>
            </p>

            {isLoading ? (
                /* === Skeleton loading state === */
                <div className="featured-boxes-skeleton-row" aria-busy="true" aria-label={t('Chargement...')}>
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="featured-box-skeleton">
                            <div className="skeleton-img" />
                            <div className="skeleton-line skeleton-line-title" />
                            <div className="skeleton-line skeleton-line-sub" />
                            <div className="skeleton-line skeleton-line-btn" />
                        </div>
                    ))}
                </div>
            ) : (
                /* === Swiper carousel === */
                <Swiper
                    slidesPerView="auto"
                    spaceBetween={12}
                    grabCursor={true}
                    modules={[Pagination]}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    className="featured-boxes-swiper"
                    a11y={{ enabled: true }}
                >
                    {displayedBoxes.map((box) => (
                        <SwiperSlide key={box.id} className="featured-box-slide">
                            <IonCard
                                className="featured-box-card card translucent-style"
                                button={false}
                            >
                                {/* Product image — floats above card top edge */}
                                <div className="featured-box-img-wrap">
                                    {/* Promotion badge */}
                                    {box.is_on_promotion && box.discount_percentage && (
                                        <div className="featured-box-promo-badge" aria-label={`-${box.discount_percentage}%`}>
                                            -{box.discount_percentage}%
                                        </div>
                                    )}
                                    <IonImg
                                        src={box.illustration}
                                        alt={box.wording}
                                        className="featured-box-img"
                                    />
                                </div>

                                <IonCardContent className="featured-box-body">
                                    <IonCardTitle className="featured-box-title title-color font-md">
                                        {box.wording}
                                    </IonCardTitle>
                                    <IonCardSubtitle className="featured-box-capacity content-color font-sm">
                                        {box.capacity} {t('découpes')}
                                    </IonCardSubtitle>

                                    <div className="featured-box-footer">
                                        <PriceDisplay
                                            price={box.price}
                                            promotionalPrice={box.promotional_price}
                                            isOnPromotion={box.is_on_promotion}
                                            discountPercentage={box.discount_percentage}
                                            size="small"
                                        />
                                        <IonButton
                                            fill="solid"
                                            size="small"
                                            color="primary"
                                            className="featured-box-btn"
                                            onClick={() => handleNavigate(box.id)}
                                            aria-label={`${t('Composer')} ${box.wording}`}
                                        >
                                            <span className="btn-text">{t('Composer')}</span>
                                        </IonButton>
                                    </div>
                                </IonCardContent>
                            </IonCard>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            {/* Savings nudge — shown when data is loaded */}
            {!isLoading && (
                <p className="featured-boxes-savings">
                    {t('Économisez jusqu\'à 20% vs l\'achat à l\'unité')}
                </p>
            )}
        </section>
    );
};

export default FeaturedBoxes;
