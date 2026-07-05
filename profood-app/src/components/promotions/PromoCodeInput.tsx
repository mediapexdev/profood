import React, { useState } from 'react';

import { IonButton, IonInput, IonItem, IonIcon, IonSpinner } from '@ionic/react';
import { closeCircleOutline, pricetagOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import { validatePromoCode } from '../../services/PromoService';
import { PromoValidationResult } from '../../types/Promotion';
import useToast from '../../components/hooks/useToast';

type AppliedPromo = NonNullable<PromoValidationResult['promotion']>;

interface PromoCodeInputProps {
    /** Cart subtotal (boxes + slices) in Fcfa, sent to the backend for validation. */
    subtotal: number;
    /** Currently applied promo, or null. */
    applied: AppliedPromo | null;
    /** Called with the validated promotion when a code is successfully applied. */
    onApplied: (promo: AppliedPromo) => void;
    /** Called when the applied code is removed. */
    onRemoved: () => void;
}

/**
 * Shared promo-code entry used on the cart summary for BOTH guest and
 * logged-in customers. On success it persists the validated promotion to
 * localStorage under 'appliedPromoCode' (the key GuestCheckoutPage and
 * OrderSummary read) and notifies the parent so the total updates.
 *
 * The discount shown here is cosmetic: the backend re-validates the code and
 * recomputes the discount authoritatively at order creation.
 */
const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ subtotal, applied, onApplied, onRemoved }) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const apply = async () => {
        const trimmed = code.trim();
        if (!trimmed) return;
        setLoading(true);
        const result = await validatePromoCode(trimmed, subtotal);
        setLoading(false);
        if (result.valid && result.promotion) {
            localStorage.setItem('appliedPromoCode', JSON.stringify(result.promotion));
            onApplied(result.promotion);
            setCode('');
            showToast(t('Code promo appliqué'));
        } else {
            // The backend returns `error` as a translation key; fall back to a
            // generic (already-translated) message otherwise.
            showToast(t(result.error || 'Code invalide'));
        }
    };

    const remove = () => {
        localStorage.removeItem('appliedPromoCode');
        onRemoved();
    };

    if (applied) {
        return (
            <div className="promo-applied content-color font-sm">
                <IonIcon icon={pricetagOutline} />
                <span className="ms-1">{applied.code}</span>
                <IonButton fill="clear" size="small" onClick={remove}>
                    <IonIcon icon={closeCircleOutline} slot="icon-only" />
                </IonButton>
            </div>
        );
    }

    return (
        <div className="promo-input-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <IonItem lines="none" className="promo-input-item" style={{ flex: 1 }}>
                <IonInput
                    value={code}
                    placeholder={t('Code promo')}
                    onIonInput={(e) => setCode((e.detail.value ?? '').toUpperCase())}
                />
            </IonItem>
            <IonButton size="small" fill="outline" disabled={loading || !code.trim()} onClick={apply}>
                {loading ? <IonSpinner name="dots" /> : t('Appliquer')}
            </IonButton>
        </div>
    );
};

export default PromoCodeInput;
