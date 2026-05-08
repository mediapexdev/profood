import React, { useCallback } from 'react';

import { IonButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import useGoTo from '../../../components/hooks/useGoTo';

import './FooterCTA.css';

/**
 * FooterCTA — final conversion call-to-action at the bottom of the
 * home page.
 *
 * Provides two parallel paths:
 *  - Primary:   "Créer mon premier Box" → /box-types/
 *  - Secondary: "Voir la carte" (individual cuts) → /categories/
 *
 * Also surfaces the "no account needed" reassurance copy to lower
 * the perceived barrier for new visitors.
 *
 * Static component — no data dependencies.
 */
const FooterCTA: React.FC = () => {
    const { t } = useTranslation();
    const goTo = useGoTo();

    const handleBoxCTA = useCallback(() => {
        goTo('/box-types/', 'none', 'push');
    }, [goTo]);

    const handleSlicesCTA = useCallback(() => {
        goTo('/categories/', 'none', 'push');
    }, [goTo]);

    return (
        <section className="footer-cta-section home-section" aria-label={t('Prêt à commander ?')}>
            <div className="footer-cta-inner">
                {/* Headline */}
                <h2 className="footer-cta-heading">{t('Prêt à commander ?')}</h2>

                {/* Reassurance — no account required friction */}
                <p className="footer-cta-note">
                    {t('Pas de compte nécessaire pour commander.')}
                </p>

                {/* Action buttons */}
                <div className="footer-cta-actions">
                    <IonButton
                        fill="solid"
                        color="primary"
                        size="default"
                        expand="block"
                        className="footer-cta-btn footer-cta-btn-primary"
                        onClick={handleBoxCTA}
                        aria-label={t('Créer mon premier Box')}
                    >
                        {t('Créer mon premier Box')}
                    </IonButton>
                    <IonButton
                        fill="outline"
                        color="primary"
                        size="default"
                        expand="block"
                        className="footer-cta-btn footer-cta-btn-secondary"
                        onClick={handleSlicesCTA}
                        aria-label={t('Achetez au détail')}
                    >
                        {t('Achetez au détail')}
                    </IonButton>
                </div>

                {/* Subtle brand tagline at the very bottom */}
                <p className="footer-cta-tagline">{t('Le Goût, la Qualité, le Service')}</p>
            </div>
        </section>
    );
};

export default FooterCTA;
