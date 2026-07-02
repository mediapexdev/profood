import React from 'react';

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonIcon,
    IonImg,
} from '@ionic/react';
import { reload } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';

import { SliceProps } from '../../../components/slices/Slice';
import PriceDisplay from '../../../components/price/PriceDisplay';
import useGoToCart from '../../../components/hooks/useGoToCart';
import useSliceCartHandlers from '../../../components/hooks/useSliceCartHandlers';
import CategoryProvider from '../../../contexts/CategoryProvider';
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
 * Inner component — must live under CategoryProvider so the quantity
 * steppers of LOGGED-IN users accumulate a selection, exactly like
 * category pages.  Guests bypass the selection entirely: their taps go
 * straight to the localStorage guest cart (same behaviour as
 * CategoriesPage), so they can order without an account.
 */
const PopularSlicesContent: React.FC<PopularSlicesProps> = ({ slices }) => {
    const { t } = useTranslation();
    const goToCart = useGoToCart();

    const {
        logged,
        totalNumber,
        guestTotal,
        handleAdd,
        handleRemove,
        displayedQuantity,
        addToCart,
        resetSelection,
    } = useSliceCartHandlers(slices);

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
                <IonButton
                    fill="clear"
                    size="small"
                    color="primary"
                    className="popular-slices-see-all"
                    routerLink="/categories/"
                    aria-label={t('Voir tout')}
                >
                    {t('Voir tout')}
                </IonButton>
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
                        const qty = displayedQuantity(slice.id);

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
                                            onIonError={(e) => {
                                                /* Broken/missing illustration: hide the img so the
                                                   wrapper's placeholder icon shows instead of the
                                                   browser broken-image glyph */
                                                (e.target as HTMLElement).classList.add('ps-img-broken');
                                            }}
                                            onIonImgDidLoad={(e) => {
                                                /* The src can recover (retry, cache) after a failure —
                                                   un-hide the image again */
                                                (e.target as HTMLElement).classList.remove('ps-img-broken');
                                            }}
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

            {/* Selection bar (logged users): submit the selection to the
                server cart */}
            {logged && totalNumber > 0 && (
                <div className="ps-selection-bar" role="status">
                    <span className="ps-selection-count">
                        {totalNumber} {t('découpes')}
                    </span>
                    <div className="ps-selection-actions">
                        <IonButton
                            type="button"
                            buttonType="button"
                            size="small"
                            color="primary"
                            className="ps-selection-add"
                            onClick={addToCart}
                        >
                            {t('Ajouter au panier')}
                        </IonButton>
                        <IonButton
                            type="button"
                            buttonType="button"
                            size="small"
                            fill="clear"
                            className="ps-selection-reset"
                            onClick={resetSelection}
                            aria-label={t('Réinitialiser la sélection')}
                        >
                            <IonIcon icon={reload} />
                        </IonButton>
                    </div>
                </div>
            )}

            {/* Cart shortcut (guests): items were added to the guest cart
                immediately — offer a jump to the cart to finish the order
                without an account */}
            {!logged && guestTotal > 0 && (
                <div className="ps-selection-bar" role="status">
                    <span className="ps-selection-count">
                        {guestTotal} {t('découpes')}
                    </span>
                    <div className="ps-selection-actions">
                        <IonButton
                            type="button"
                            buttonType="button"
                            size="small"
                            color="primary"
                            className="ps-selection-add"
                            onClick={() => goToCart()}
                        >
                            {t('Voir le panier')}
                        </IonButton>
                    </div>
                </div>
            )}
        </section>
    );
};

/**
 * PopularSlices — horizontal Swiper carousel of individual cut cards.
 *
 * Dynamic: renders from DataContext.slicesProps.  Shows skeleton cards
 * while the array is empty.
 *
 * Logged-in users build a selection (CategoryProvider) submitted through
 * the "Ajouter au panier" bar — same API flow as the category pages.
 * Guests add straight to the localStorage guest cart and are offered a
 * shortcut to the cart, where the guest checkout flow takes over: no
 * account is required to place an order.
 */
const PopularSlices: React.FC<PopularSlicesProps> = (props) => (
    <CategoryProvider>
        <PopularSlicesContent {...props} />
    </CategoryProvider>
);

export default PopularSlices;
