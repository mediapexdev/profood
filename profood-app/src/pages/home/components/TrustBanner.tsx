import React from 'react';

import { IonCard, IonCardContent } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import './TrustBanner.css';

/**
 * TrustBanner — quality-guarantee section ("Pourquoi Profood ?").
 *
 * Displays four trust pillars:
 *  1. Express delivery — ordered before 14h, delivered next day
 *  2. Quality guaranteed — locally sourced meats
 *  3. 100% Halal — Islamic slaughter rites
 *  4. Cold chain — refrigerated transport end-to-end
 *
 * Static component — all copy is hardcoded (sourced from existing
 * translation keys).  No data dependencies.
 *
 * Placed after PopularSlices to reinforce why Profood before the
 * final FooterCTA conversion block.
 */
const TrustBanner: React.FC = () => {
    const { t } = useTranslation();

    const pillars = [
        {
            id: 'delivery',
            icon: (
                // Speedometer / express icon
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="trust-icon-svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            color: '#E74C3C',
            title: t('Livraison express'),
            detail: t('Commandé avant 14h = livré le lendemain'),
        },
        {
            id: 'quality',
            icon: (
                // Shield check icon
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="trust-icon-svg">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            color: '#27AE60',
            title: t('Qualité garantie'),
            detail: t('Viandes sélectionnées chez nos éleveurs locaux'),
        },
        {
            id: 'halal',
            icon: (
                // Crescent moon — universally recognised Halal symbol
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="trust-icon-svg">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            color: '#F39C12',
            title: t('100% Halal'),
            detail: t('Abattage selon les rites islamiques'),
        },
        {
            id: 'cold',
            icon: (
                // Snowflake icon
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="trust-icon-svg">
                    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 6L4 18M20 18L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 2l-3 3 3 3 3-3-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22l-3-3 3-3 3 3-3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            color: '#3498DB',
            title: t('Fraîcheur garantie'),
            detail: t('Transport réfrigéré de bout en bout'),
        },
    ];

    return (
        <section className="trust-section home-section" aria-label={t('Pourquoi Profood ?')}>
            <h2 className="trust-heading">{t('Pourquoi Profood ?')}</h2>

            <div className="trust-grid">
                {pillars.map((pillar) => (
                    <IonCard key={pillar.id} className="trust-card translucent-style">
                        <IonCardContent className="trust-card-body">
                            {/* Coloured icon circle */}
                            <div
                                className="trust-icon-wrap"
                                style={{ background: `${pillar.color}1A`, color: pillar.color }}
                                aria-hidden="true"
                            >
                                {pillar.icon}
                            </div>

                            {/* Title + detail */}
                            <p className="trust-title">{pillar.title}</p>
                            <p className="trust-detail">{pillar.detail}</p>
                        </IonCardContent>
                    </IonCard>
                ))}
            </div>
        </section>
    );
};

export default TrustBanner;
