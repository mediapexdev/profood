import React, { useContext } from 'react';

import { IonButton } from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { useIonRouter } from '@ionic/react';
import UserInfosContext from '../../contexts/UserInfosContext';

/**
 * Props accepted by LoginPrompt.
 *
 * `icon` and `title` / `description` allow call sites to communicate context
 * to the user ("why am I seeing this?") while keeping the buttons and layout
 * consistent.
 *
 * `showGuestOption` — when true a third "Continuer en invité" button is shown.
 * Defaults to false because most contexts (account, orders) have no meaningful
 * guest-mode.  The cart / checkout call sites can enable it when the guest
 * checkout flow exists.
 *
 * `onGuestContinue` — callback invoked when the user taps "Continuer en
 * invité".  If omitted and showGuestOption is true the button still renders
 * but performs a no-op, so callers are not forced to provide it.
 *
 * `mode` — "inline" renders a card-like block inside the page content.
 * "modal" is reserved for future IonModal wrapping and currently falls back
 * to "inline".
 */
export interface LoginPromptProps {
    /** Emoji or image URL to display above the title. */
    icon?: string;
    /** Short heading that names the feature behind the gate. */
    title?: string;
    /** One-sentence explanation of what the user gains by logging in. */
    description?: string;
    /** Show "Continuer en invité" button. Default: false. */
    showGuestOption?: boolean;
    /** Called when the user taps "Continuer en invité". */
    onGuestContinue?: () => void;
    /** "inline" | "modal" — only "inline" is implemented. Default: "inline". */
    mode?: 'inline' | 'modal';
}

/**
 * LoginPrompt — reusable authentication gate component.
 *
 * Renders a centred card with benefit copy, then three action buttons:
 *   1. "Se connecter"        → navigates to /signin
 *   2. "Créer un compte"     → navigates to /signup
 *   3. "Continuer en invité" → calls onGuestContinue (hidden by default)
 *
 * The component is a pure presentational gate: it does NOT read UserInfosContext
 * itself to decide visibility.  The parent page is responsible for only mounting
 * LoginPrompt when the user is not logged in.  This keeps the component
 * side-effect-free and easily testable.
 *
 * Usage:
 * ```tsx
 * const { logged } = useUserInfosContext();
 * if (!logged) {
 *   return <LoginPrompt icon="📦" title="Mes commandes" description="..." />;
 * }
 * ```
 *
 * The `mode` prop is present for future IonModal integration (e.g. showing the
 * prompt as an overlay without navigating away).  Currently only "inline" is
 * implemented.
 */
const LoginPrompt: React.FC<LoginPromptProps> = ({
    icon = '🔒',
    title,
    description,
    showGuestOption = false,
    onGuestContinue,
    // mode is reserved — inline is the only implementation right now
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mode = 'inline',
}) => {
    const { t } = useTranslation();
    const router = useIonRouter();

    /**
     * Read logged status so we silently become a no-op if the user somehow
     * becomes authenticated while this component is still mounted.
     */
    const { logged } = useContext(UserInfosContext);

    // Guard: don't render anything if the user is already logged in.
    if (logged) {
        return null;
    }

    return (
        <div className="login-prompt ion-padding">
            <div className="d-flex flex-column flex-center">

                {/* ── Icon ───────────────────────────────────────────────── */}
                {icon && (
                    <div className="login-prompt-icon mb-3" aria-hidden="true">
                        {/* Support both emoji strings and URL strings */}
                        {icon.startsWith('http') || icon.startsWith('/') ? (
                            <img src={icon} alt="" className="login-prompt-icon-img" />
                        ) : (
                            <span style={{ fontSize: '3rem' }}>{icon}</span>
                        )}
                    </div>
                )}

                {/* ── Title ──────────────────────────────────────────────── */}
                {title && (
                    <h2 className="login-prompt-title title-color font-lg text-center mb-2">
                        {title}
                    </h2>
                )}

                {/* ── Description ────────────────────────────────────────── */}
                {description && (
                    <p className="login-prompt-description content-color font-sm text-center mb-4">
                        {description}
                    </p>
                )}

                {/* ── Benefits list ──────────────────────────────────────── */}
                <ul
                    className="login-prompt-benefits content-color font-sm mb-5"
                    style={{ listStyle: 'none', padding: 0, textAlign: 'center' }}
                >
                    <li>{t('Suivez vos commandes en temps réel')}</li>
                    <li>{t('Sauvegardez vos adresses de livraison')}</li>
                    <li>{t('Retrouvez votre historique d\'achats')}</li>
                </ul>

                {/* ── Action buttons ─────────────────────────────────────── */}
                <div
                    className="login-prompt-actions d-flex flex-column"
                    style={{ width: '100%', maxWidth: '320px', gap: '0.75rem' }}
                >
                    {/* Primary: sign in */}
                    <IonButton
                        type="button"
                        expand="block"
                        fill="solid"
                        size="default"
                        color="primary"
                        className="login-prompt-btn-signin"
                        onClick={() => router.push('/signin', 'forward', 'push')}
                    >
                        <span>{t('Se connecter')}</span>
                    </IonButton>

                    {/* Secondary: create account */}
                    <IonButton
                        type="button"
                        expand="block"
                        fill="outline"
                        size="default"
                        color="primary"
                        className="login-prompt-btn-signup"
                        onClick={() => router.push('/signup', 'forward', 'push')}
                    >
                        <span>{t('Créer un compte')}</span>
                    </IonButton>

                    {/* Optional: continue as guest */}
                    {showGuestOption && (
                        <IonButton
                            type="button"
                            expand="block"
                            fill="clear"
                            size="default"
                            color="medium"
                            className="login-prompt-btn-guest"
                            onClick={onGuestContinue ?? (() => { /* no-op when callback not provided */ })}
                        >
                            <span>{t('Continuer en invité')}</span>
                        </IonButton>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LoginPrompt;
