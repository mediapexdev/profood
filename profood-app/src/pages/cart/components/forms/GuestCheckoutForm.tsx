import React, { useCallback, useState } from 'react';

import {
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonTextarea,
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

/**
 * Guest contact and delivery information collected by this form.
 *
 * Field names mirror what GuestCheckoutPage passes to the API:
 *   guest_first_name, guest_last_name, guest_phone_number, guest_email, address
 */
export interface GuestInfo {
    firstName: string;
    lastName: string;
    /** 9-digit Senegalese number without country code, e.g. "771234567" */
    phoneNumber: string;
    /** Optional — empty string when not provided */
    email: string;
    address: string;
    /** Index-signature so callers can spread the object freely */
    [key: string]: any;
}

interface GuestCheckoutFormProps {
    onSubmit: (info: GuestInfo) => void;
    onCancel?: () => void;
}

/**
 * Regex that mirrors the server-side validation rule in StoreGuestOrderRequest:
 *   ^(3[3]|7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$
 *
 * Accepts the raw 9-digit form the user is likely to type (spaces stripped before
 * comparing). Valid Senegalese prefixes: 33, 75, 76, 77, 78, 70.
 */
const SENEGAL_PHONE_REGEX = /^(3[3]|7[5-80])\d{3}(\d{2}){2}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strips all whitespace from a phone string so the regex above can match
 * regardless of whether the user typed "77 123 45 67" or "771234567".
 */
const normalizePhone = (value: string): string => value.replace(/\s+/g, '');

/**
 * GuestCheckoutForm — Step 1 of the guest checkout flow.
 *
 * Collects delivery contact information for customers who want to order without
 * creating an account.  Validation is intentionally client-side only; the
 * server applies its own rules via StoreGuestOrderRequest.
 *
 * The parent (GuestCheckoutPage) owns submission logic; this component only
 * validates and calls onSubmit with a clean GuestInfo object.
 */
const GuestCheckoutForm: React.FC<GuestCheckoutFormProps> = ({ onSubmit, onCancel }) => {
    const { t } = useTranslation();

    // ── Form field state ───────────────────────────────────────────────────────
    const [firstName, setFirstName]   = useState<string>('');
    const [lastName, setLastName]     = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail]           = useState<string>('');
    const [address, setAddress]       = useState<string>('');

    // ── Touched state — show errors only after user has interacted with a field
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const markTouched = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    // ── Derived validation ─────────────────────────────────────────────────────

    /** First name: required, max 255 chars */
    const firstNameError = !firstName.trim()
        ? t('Le prénom est obligatoire')
        : firstName.trim().length > 255
        ? t('Le prénom ne doit pas dépasser 255 caractères')
        : null;

    /** Last name: required, max 255 chars */
    const lastNameError = !lastName.trim()
        ? t('Le nom de famille est obligatoire')
        : lastName.trim().length > 255
        ? t('Le nom de famille ne doit pas dépasser 255 caractères')
        : null;

    /** Phone: required, Senegalese format */
    const normalizedPhone = normalizePhone(phoneNumber);
    const phoneError = !normalizedPhone
        ? t('Le numéro de téléphone est obligatoire')
        : !SENEGAL_PHONE_REGEX.test(normalizedPhone)
        ? t('Format requis: 77, 78, 76, 75, 70 ou 33')
        : null;

    /** Email: optional, but must be valid format when provided */
    const emailError =
        email.trim() && !EMAIL_REGEX.test(email.trim())
            ? t('Adresse e-mail invalide')
            : null;

    /** Address: required, max 255 chars */
    const addressError = !address.trim()
        ? t('Veuillez renseigner votre adresse de livraison')
        : address.trim().length > 255
        ? t("L'adresse ne doit pas dépasser 255 caractères")
        : null;

    const isValid =
        !firstNameError &&
        !lastNameError &&
        !phoneError &&
        !emailError &&
        !addressError;

    // ── Submit handler ─────────────────────────────────────────────────────────

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            // Mark all fields touched so errors display on attempted submit
            setTouched({
                firstName: true,
                lastName: true,
                phoneNumber: true,
                email: true,
                address: true,
            });

            if (!isValid) return;

            onSubmit({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                // Pass the normalised form so the API regex always matches
                phoneNumber: normalizedPhone,
                email: email.trim(),
                address: address.trim(),
            });
        },
        [isValid, onSubmit, firstName, lastName, normalizedPhone, email, address]
    );

    // ── Render helpers ─────────────────────────────────────────────────────────

    /**
     * Returns the IonItem colour prop: 'danger' when the field is touched and
     * invalid, 'success' when touched and valid, undefined otherwise.
     */
    const itemColor = (field: string, error: string | null) => {
        if (!touched[field]) return undefined;
        return error ? 'danger' : 'success';
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            {/* ── Section title ──────────────────────────────────────────── */}
            <p className="content-color font-sm" style={{ marginBottom: '1rem' }}>
                {t('Informations de livraison')}
            </p>

            {/* ── First name ─────────────────────────────────────────────── */}
            <IonItem
                lines="full"
                color={itemColor('firstName', firstNameError)}
                style={{ marginBottom: '0.5rem' }}
            >
                <IonLabel position="floating">{t('Prénom')} *</IonLabel>
                <IonInput
                    type="text"
                    value={firstName}
                    autocomplete="given-name"
                    inputmode="text"
                    maxlength={255}
                    onIonInput={(e) => setFirstName(e.detail.value ?? '')}
                    onIonBlur={() => markTouched('firstName')}
                    aria-label={t('Prénom')}
                />
                {touched.firstName && firstNameError && (
                    <IonNote slot="error" color="danger" className="font-xs">
                        {firstNameError}
                    </IonNote>
                )}
            </IonItem>

            {/* ── Last name ──────────────────────────────────────────────── */}
            <IonItem
                lines="full"
                color={itemColor('lastName', lastNameError)}
                style={{ marginBottom: '0.5rem' }}
            >
                <IonLabel position="floating">{t('Nom')} *</IonLabel>
                <IonInput
                    type="text"
                    value={lastName}
                    autocomplete="family-name"
                    inputmode="text"
                    maxlength={255}
                    onIonInput={(e) => setLastName(e.detail.value ?? '')}
                    onIonBlur={() => markTouched('lastName')}
                    aria-label={t('Nom')}
                />
                {touched.lastName && lastNameError && (
                    <IonNote slot="error" color="danger" className="font-xs">
                        {lastNameError}
                    </IonNote>
                )}
            </IonItem>

            {/* ── Phone number ───────────────────────────────────────────── */}
            <IonItem
                lines="full"
                color={itemColor('phoneNumber', phoneError)}
                style={{ marginBottom: '0.5rem' }}
            >
                <IonLabel position="floating">{t('Numéro de téléphone')} *</IonLabel>
                <IonInput
                    type="tel"
                    value={phoneNumber}
                    autocomplete="tel-national"
                    inputmode="tel"
                    maxlength={15}
                    placeholder="77 123 45 67"
                    onIonInput={(e) => setPhoneNumber(e.detail.value ?? '')}
                    onIonBlur={() => markTouched('phoneNumber')}
                    aria-label={t('Numéro de téléphone')}
                />
                {touched.phoneNumber && phoneError && (
                    <IonNote slot="error" color="danger" className="font-xs">
                        {phoneError}
                    </IonNote>
                )}
                {!touched.phoneNumber && (
                    <IonNote slot="helper" className="font-xs content-color">
                        {t('Format requis: 77, 78, 76, 75, 70 ou 33')}
                    </IonNote>
                )}
            </IonItem>

            {/* ── Email (optional) ───────────────────────────────────────── */}
            <IonItem
                lines="full"
                color={itemColor('email', emailError)}
                style={{ marginBottom: '0.5rem' }}
            >
                <IonLabel position="floating">{t('Adresse e-mail (optionnel)')}</IonLabel>
                <IonInput
                    type="email"
                    value={email}
                    autocomplete="email"
                    inputmode="email"
                    maxlength={255}
                    onIonInput={(e) => setEmail(e.detail.value ?? '')}
                    onIonBlur={() => markTouched('email')}
                    aria-label={t('Adresse e-mail (optionnel)')}
                />
                {touched.email && emailError && (
                    <IonNote slot="error" color="danger" className="font-xs">
                        {emailError}
                    </IonNote>
                )}
            </IonItem>

            {/* ── Delivery address ───────────────────────────────────────── */}
            <IonItem
                lines="full"
                color={itemColor('address', addressError)}
                style={{ marginBottom: '0.5rem' }}
            >
                <IonLabel position="floating">{t('Adresse de livraison')} *</IonLabel>
                <IonTextarea
                    value={address}
                    rows={3}
                    maxlength={255}
                    placeholder={t('Ex: Dakar, Plateau, Rue Félix Faure')}
                    onIonInput={(e) => setAddress(e.detail.value ?? '')}
                    onIonBlur={() => markTouched('address')}
                    aria-label={t('Adresse de livraison')}
                />
                {touched.address && addressError && (
                    <IonNote slot="error" color="danger" className="font-xs">
                        {addressError}
                    </IonNote>
                )}
            </IonItem>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <div style={{ marginTop: '1.5rem' }}>
                <IonButton
                    type="submit"
                    expand="block"
                    fill="solid"
                    size="default"
                    color="primary"
                    strong
                    /*
                     * Disable only when the user has started interacting AND
                     * the form is still invalid. Before any interaction the
                     * button stays enabled so the user can tap-to-submit and
                     * see all errors at once (better UX on mobile).
                     */
                    disabled={Object.keys(touched).length > 0 && !isValid}
                >
                    <span style={{ color: '#fff' }}>{t('Continuer')}</span>
                </IonButton>
            </div>

            {/* ── Cancel ─────────────────────────────────────────────────── */}
            {onCancel && (
                <div style={{ marginTop: '0.75rem' }}>
                    <IonButton
                        type="button"
                        expand="block"
                        fill="outline"
                        size="default"
                        color="medium"
                        onClick={onCancel}
                    >
                        {t('Annuler')}
                    </IonButton>
                </div>
            )}
        </form>
    );
};

export default GuestCheckoutForm;
