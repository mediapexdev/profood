import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
} from '@ionic/react';
import { locationOutline } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../../../contexts/DataProvider';

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
 * Lowercases and strips accents so "médina" matches "Medina" and vice versa.
 */
const normalizeText = (value: string): string =>
    value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Maximum number of locality suggestions rendered under the field */
const MAX_SUGGESTIONS = 8;

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

    /**
     * Existing delivery localities (fetched once app-wide by DataProvider).
     * They power the destination autocomplete below.
     */
    const { localities, fetchLocalities } = useDataContext();

    /**
     * Resilience: if the initial app-wide fetch failed (offline at launch,
     * API hiccup), retry silently when the guest reaches the checkout form.
     */
    const localitiesRequested = useRef<boolean>(false);
    useEffect(() => {
        if (localities.length === 0 && !localitiesRequested.current) {
            localitiesRequested.current = true;
            fetchLocalities(false);
        }
    }, [localities.length, fetchLocalities]);

    // ── Form field state ───────────────────────────────────────────────────────
    const [firstName, setFirstName]   = useState<string>('');
    const [lastName, setLastName]     = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail]           = useState<string>('');
    const [address, setAddress]       = useState<string>('');
    /** Id of the chosen locality — sent so the order resolves its delivery zone. */
    const [selectedLocaliteId, setSelectedLocaliteId] = useState<number | undefined>(undefined);

    /** Whether the locality suggestion list is visible */
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    // ── Touched state — show errors only after user has interacted with a field
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const markTouched = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    // ── Locality autocomplete ──────────────────────────────────────────────────

    /** Localities whose wording contains the typed text (accent-insensitive) */
    const suggestions = useMemo(() => {
        const query = normalizeText(address.trim());
        if (!query) return [];
        return localities
            .filter(locality => normalizeText(locality.wording).includes(query))
            .slice(0, MAX_SUGGESTIONS);
    }, [address, localities]);

    /** True when the typed text exactly matches an existing locality */
    const matchesKnownLocality = useMemo(() => {
        const query = normalizeText(address.trim());
        return query.length > 0
            && localities.some(locality => normalizeText(locality.wording) === query);
    }, [address, localities]);

    /** Fills the field with the tapped suggestion and closes the list */
    const selectLocality = useCallback((locality: { id: number; wording: string }) => {
        setAddress(locality.wording);
        setSelectedLocaliteId(locality.id);
        setShowSuggestions(false);
        markTouched('address');
    }, [markTouched]);

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

    /**
     * Address: required, max 255 chars.
     * When the locality list is available, the destination must be one of the
     * existing localities (same rule as the logged-in flow's LocalityModal).
     * If the list could not be loaded, fall back to free text so a guest is
     * never blocked from ordering.
     */
    const addressError = !address.trim()
        ? t('Veuillez renseigner votre adresse de livraison')
        : address.trim().length > 255
        ? t("L'adresse ne doit pas dépasser 255 caractères")
        : localities.length > 0 && !matchesKnownLocality
        ? t('Veuillez sélectionner une localité dans la liste')
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

            // Resolve the locality id: the tapped suggestion, or an exact
            // name match when the guest typed the full locality name.
            const normalizedAddress = normalizeText(address.trim());
            const resolvedLocaliteId = selectedLocaliteId
                ?? localities.find(l => normalizeText(l.wording) === normalizedAddress)?.id;

            onSubmit({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                // Pass the normalised form so the API regex always matches
                phoneNumber: normalizedPhone,
                email: email.trim(),
                address: address.trim(),
                localiteId: resolvedLocaliteId,
            });
        },
        [isValid, onSubmit, firstName, lastName, normalizedPhone, email, address, selectedLocaliteId, localities]
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

    /**
     * Renders a field error below its IonItem. Rendered in-flow (not in the
     * item's "error" slot) because Ionic hides slotted notes unless the item
     * carries its native ion-invalid class, which custom validation never sets.
     */
    const fieldError = (field: string, error: string | null) =>
        touched[field] && error ? (
            <IonNote color="danger" className="guest-field-note font-xs">
                {error}
            </IonNote>
        ) : null;

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
            </IonItem>
            {fieldError('firstName', firstNameError)}

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
            </IonItem>
            {fieldError('lastName', lastNameError)}

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
            </IonItem>
            {fieldError('phoneNumber', phoneError)}
            {!touched.phoneNumber && (
                <IonNote className="guest-field-note font-xs content-color">
                    {t('Format requis: 77, 78, 76, 75, 70 ou 33')}
                </IonNote>
            )}

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
            </IonItem>
            {fieldError('email', emailError)}

            {/* ── Delivery destination (locality autocomplete) ───────────── */}
            <IonItem
                lines="full"
                color={itemColor('address', addressError)}
                style={{ marginBottom: '0.5rem' }}
            >
                <IonLabel position="floating">{t('Adresse de livraison')} *</IonLabel>
                <IonInput
                    type="text"
                    value={address}
                    maxlength={255}
                    placeholder={t('Rechercher votre localité')}
                    onIonInput={(e) => {
                        setAddress(e.detail.value ?? '');
                        // Typing invalidates a previously tapped suggestion.
                        setSelectedLocaliteId(undefined);
                        setShowSuggestions(true);
                    }}
                    onIonFocus={() => setShowSuggestions(true)}
                    onIonBlur={() => {
                        markTouched('address');
                        // Delay so a tap on a suggestion lands before the list closes
                        setTimeout(() => setShowSuggestions(false), 250);
                    }}
                    aria-label={t('Adresse de livraison')}
                />
            </IonItem>
            {fieldError('address', addressError)}
            {!touched.address && localities.length > 0 && (
                <IonNote className="guest-field-note font-xs content-color">
                    {t('Commencez à taper puis choisissez votre localité')}
                </IonNote>
            )}

            {/* Suggestion list — rendered in-flow to avoid IonCard clipping */}
            {showSuggestions && suggestions.length > 0 && !matchesKnownLocality && (
                <IonList className="locality-suggestions" lines="full">
                    {suggestions.map(locality => (
                        <IonItem
                            button
                            detail={false}
                            key={locality.id}
                            onClick={() => selectLocality(locality)}
                        >
                            <IonIcon
                                icon={locationOutline}
                                slot="start"
                                size="small"
                                color="primary"
                            />
                            <IonLabel className="content-color font-sm ion-text-wrap">
                                {locality.wording}
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            )}

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
