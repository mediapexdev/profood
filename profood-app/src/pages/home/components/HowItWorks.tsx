import React from 'react';

import { IonCard, IonCardContent } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import './HowItWorks.css';

/**
 * HowItWorks — three-step explanation of the ordering process.
 *
 * Steps:
 *  1. Choose a Box (or individual cuts)
 *  2. We prepare your order
 *  3. Express delivery to your door
 *
 * Static component — no data dependencies.
 * Uses inline SVG icons to avoid additional asset requests and
 * to keep the icon colours in sync with the brand palette.
 */
const HowItWorks: React.FC = () => {
    const { t } = useTranslation();

    /**
     * Ordered steps data — kept here so translations stay
     * co-located with the component logic.
     */
    const steps = [
        {
            id: 1,
            icon: (
                // Shopping basket icon
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="hiw-icon-svg">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            title: t('Choisissez'),
            subtitle: t('Solo, Famille ou Grillades'),
            detail: t('Remplissez-le'),
            detailSub: t('Avec vos découpes préférées'),
        },
        {
            id: 2,
            icon: (
                // Knife / chef icon (cutting board representation)
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="hiw-icon-svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            title: t('Nous préparons'),
            subtitle: t('Payez en ligne'),
            detail: t('Ou à la livraison'),
            detailSub: '',
        },
        {
            id: 3,
            icon: (
                // Delivery scooter icon
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="hiw-icon-svg">
                    <circle cx="5.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 6h-4l-2 6H5.5M15 6l2 6m0 0H8m9 0h1.5a1.5 1.5 0 000-3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            title: t('Livraison rapide'),
            subtitle: t('Recevez frais'),
            detail: t('En 24h chez vous'),
            detailSub: '',
        },
    ];

    return (
        <section className="hiw-section home-section" aria-label={t('Comment ça marche ?')}>
            <h2 className="hiw-heading">{t('Comment ça marche ?')}</h2>

            <div className="hiw-steps">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <IonCard className="hiw-card translucent-style">
                            <IonCardContent className="hiw-card-body">
                                {/* Step number badge */}
                                <div className="hiw-step-number" aria-hidden="true">
                                    {step.id}
                                </div>

                                {/* Icon circle */}
                                <div className="hiw-icon-wrap" aria-hidden="true">
                                    {step.icon}
                                </div>

                                {/* Text content */}
                                <p className="hiw-step-title">{step.title}</p>
                                <p className="hiw-step-sub">{step.subtitle}</p>
                                {step.detail && (
                                    <p className="hiw-step-detail">
                                        {step.detail}
                                        {step.detailSub && (
                                            <span className="hiw-step-detail-sub"> — {step.detailSub}</span>
                                        )}
                                    </p>
                                )}
                            </IonCardContent>
                        </IonCard>

                        {/* Arrow connector between steps (not after last) */}
                        {index < steps.length - 1 && (
                            <div className="hiw-arrow" aria-hidden="true">
                                <svg viewBox="0 0 16 16" fill="none" className="hiw-arrow-svg">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
