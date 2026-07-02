import React, { useCallback } from 'react';

import { IonButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import useGoTo from '../../../components/hooks/useGoTo';
import { toAbsolutePublicUrl } from '../../../helpers/AssetHelpers';

import './HeroSection.css';

/**
 * HeroSection — full-width top banner for the home page.
 *
 * Displays the brand headline, a short value proposition, two
 * primary CTAs ("Créer mon Box" → /box-types/ and "Voir la carte" →
 * /categories/), and a delivery callout badge.
 *
 * Placed outside the `.app-container` wrapper in HomePage so it can
 * bleed edge-to-edge on mobile.
 *
 * Static component — no data fetching required.
 */
const HeroSection: React.FC = () => {
    const { t } = useTranslation();
    const goTo = useGoTo();

    const handleBoxCTA = useCallback(() => {
        goTo('/box-types/', 'none', 'push');
    }, [goTo]);

    const handleSlicesCTA = useCallback(() => {
        goTo('/categories/', 'none', 'push');
    }, [goTo]);

    return (
        <section className="hero-section" aria-label={t('Viande fraîche, livrée chez vous')}>
            {/* Background image layer — acheter-au-detail.jpg is a clean top-down
                flat-lay of assorted fresh meats & fish on dark trays (no baked-in
                text). A gradient overlay ensures text contrast. */}
            <div
                className="hero-bg"
                style={{
                    backgroundImage: `url(${toAbsolutePublicUrl('/media/images/illustrations/acheter-au-detail.jpg')})`,
                }}
                aria-hidden="true"
            />
            {/* Gradient overlay for text legibility on any screen brightness */}
            <div className="hero-overlay" aria-hidden="true" />

            <div className="hero-content">
                {/* Brand headline — two-line stacked display */}
                <h1 className="hero-title">
                    <span className="hero-title-line1">{t('La boucherie artisanale')}</span>
                    <span className="hero-title-accent">{t('livrée chez vous')}</span>
                </h1>

                {/* One-line value proposition */}
                <p className="hero-subtitle">
                    {t('Viandes fraîches sélectionnées à Dakar, découpées à la commande, livrées en 24h.')}
                </p>

                {/* Primary action buttons — min-height 44px for touch targets */}
                <div className="hero-actions">
                    <IonButton
                        fill="solid"
                        color="primary"
                        className="hero-btn hero-btn-primary"
                        onClick={handleBoxCTA}
                        aria-label={t('Créer mon Box')}
                    >
                        {t('Créer mon Box')}
                    </IonButton>
                    <IonButton
                        fill="solid"
                        className="hero-btn hero-btn-secondary"
                        onClick={handleSlicesCTA}
                        aria-label={t('Voir la carte')}
                    >
                        {t('Voir la carte')}
                    </IonButton>
                </div>

                {/* Delivery nudge badge — free delivery threshold */}
                <div className="hero-badge" aria-label={t('Livraison gratuite dès 25 000 FCFA')}>
                    <span className="hero-badge-icon" aria-hidden="true">🛵</span>
                    <span className="hero-badge-text">{t('Livraison gratuite dès 25 000 FCFA')}</span>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
