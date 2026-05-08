import React, { useCallback, useContext } from 'react';

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonImg,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';

import { SliceProps } from '../../../components/slices/Slice';
import PriceDisplay from '../../../components/price/PriceDisplay';
import SlicesHandlersContext from '../../../contexts/SlicesHandlersContext';
import MinusIcon from '../../../components/icons/svg/MinusIcon';
import PlusIcon from '../../../components/icons/svg/PlusIcon';

import 'swiper/css';
import './PopularSlices.css';

/**
 * Props for PopularSlices.
 *
 * `slices` is sourced from DataContext.slicesProps.
 */
interface PopularSlicesProps {
    slices: SliceProps[];
}

/**
 * PopularSlices — horizontal Swiper carousel of individual cut cards.
 *
 * Dynamic: renders from DataContext.slicesProps.  Shows skeleton cards
 * while the array is empty.
 *
 * Each card exposes the same add/remove quantity controls as the full
 * Slice component, sharing the SlicesHandlersContext so the cart
 * state stays in sync regardless of where the user adds items.
 *
 * We deliberately show only a preview (capped at 8 slices) to keep
 * the home page scannable; the full catalogue is a tap away via
 * /categories/.
 */
const PopularSlices: React.FC<PopularSlicesProps> = ({ slices }) => {
    const { t } = useTranslation();

    /**
     * Shared cart handlers — same context used by the Slice component
     * in category pages, so quantity state is consistent.
     */
    const { add, remove, getQuantity } = useContext(SlicesHandlersContext);

    const handleAdd = useCallback((id: number) => {
        add({ id, quantity: 1 });
    }, [add]);

    const handleRemove = useCallback((id: number) => {
        remove(id);
    }, [remove]);

    const isLoading = slices.length === 0;

    /**
     * Cap at 8 items; home page is a teaser not an exhaustive list.
     * Sorting by the API's natural order (which reflects admin
     * ordering) is fine — no extra client-side sort needed.
     */
    const displayedSlices = slices.slice(0, 8);

    return (
        <section className="popular-slices-section home-section" aria-label={t('Acheter au détail')}>
            <div className="popular-slices-header">
                <h2 className="popular-slices-heading">{t('Acheter au détail')}</h2>
            </div>

            {isLoading ? (
                /* Skeleton row */
                <div className="popular-slices-skeleton-row" aria-busy="true" aria-label={t('Chargement...')}>
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="ps-skeleton">
                            <div className="ps-skel-img" />
                            <div className="ps-skel-line ps-skel-title" />
                            <div className="ps-skel-line ps-skel-sub" />
                            <div className="ps-skel-line ps-skel-btn" />
                        </div>
                    ))}
                </div>
            ) : (
                <Swiper
                    slidesPerView="auto"
                    spaceBetween={10}
                    grabCursor={true}
                    className="popular-slices-swiper"
                    a11y={{ enabled: true }}
                >
                    {displayedSlices.map((slice) => {
                        const qty = getQuantity(slice.id);

                        return (
                            <SwiperSlide key={slice.id} className="ps-slide">
                                <IonCard className="ps-card card translucent-style">
                                    {/* Product image */}
                                    <div className="ps-img-wrap">
                                        {/* Promotion badge */}
                                        {slice.is_on_promotion && slice.discount_percentage && (
                                            <div className="ps-promo-badge" aria-label={`-${slice.discount_percentage}%`}>
                                                -{slice.discount_percentage}%
                                            </div>
                                        )}
                                        <IonImg
                                            src={slice.illustration}
                                            alt={t(slice.wording)}
                                            className="ps-img"
                                        />
                                    </div>

                                    <IonCardContent className="ps-body">
                                        <IonCardTitle className="ps-title title-color font-md">
                                            {t(slice.wording)}
                                        </IonCardTitle>

                                        {/* Price display */}
                                        <div className="ps-price">
                                            <PriceDisplay
                                                price={slice.price}
                                                promotionalPrice={slice.promotional_price}
                                                isOnPromotion={slice.is_on_promotion}
                                                discountPercentage={slice.discount_percentage}
                                                size="small"
                                            />
                                        </div>

                                        {/* Quantity controls — replicates the Slice component
                                            controls so touch targets stay ≥44px */}
                                        <div className="ps-qty-row">
                                            <IonButton
                                                type="button"
                                                buttonType="button"
                                                size="small"
                                                fill="clear"
                                                className="ps-qty-btn"
                                                onClick={() => handleRemove(slice.id)}
                                                aria-label={t('Retirer')}
                                            >
                                                <MinusIcon />
                                            </IonButton>
                                            <span className="ps-qty-value" aria-live="polite">
                                                {qty}
                                            </span>
                                            <IonButton
                                                type="button"
                                                buttonType="button"
                                                size="small"
                                                fill="clear"
                                                className="ps-qty-btn"
                                                onClick={() => handleAdd(slice.id)}
                                                aria-label={t('Ajouter au panier')}
                                            >
                                                <PlusIcon />
                                            </IonButton>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            )}
        </section>
    );
};

export default PopularSlices;
