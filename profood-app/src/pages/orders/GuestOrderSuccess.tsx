import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";

import {
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonLoading,
    IonModal,
    IonNote,
    IonPage,
    IonText,
    useIonRouter,
    useIonViewDidLeave
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import { toAbsolutePublicUrl } from "../../helpers/AssetHelpers";
import Error404 from "../errors/components/Error404";
import api from "../../api/api";
import { useUserInfosContext } from "../../contexts/UserInfosProvider";
import { useCartContext } from "../cart/components/contexts/CartProvider";
import { clearGuestCart } from "../../services/GuestCartService";
import useToast from "../../components/hooks/useToast";

import './GuestOrderSuccess.css';

const GuestOrderSuccess: React.FC = () => {
    const { t } = useTranslation();
    const router = useIonRouter();
    const { id } = useParams<{ id: string; }>();
    const showToast = useToast();

    const {
        setId,
        setUserId,
        setFirstName,
        setLastName,
        setPhoneNumber,
        setEmail,
        setRole,
        setAvatar,
        setActive,
        setLogged,
        setSessionCount,
        setCreatedAt
    } = useUserInfosContext();

    const location = useLocation();
    const { updateBoxes, updateSlices } = useCartContext();

    const [storedReference, setStoredReference] = useState<string>('');
    const [orderReference, setOrderReference] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [passwordConfirm, setPasswordConfirm] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        // The URL :id must match the reference this device stored when it
        // placed the order — a crafted or stale link never validates.
        // Coming back from PayTech, ?ref= additionally carries the REAL order
        // reference (the client only knows its temporary hash at payment
        // time); it is used for display and account conversion only.
        const refFromPayment = new URLSearchParams(location.search).get('ref');
        const stored = localStorage.getItem('guest_order_reference') ?? '';

        setStoredReference(stored);
        setOrderReference(refFromPayment || stored);
    }, [location.search]);

    useIonViewDidLeave(() => {
        localStorage.removeItem('guest_order_reference');
    });

    const goToHome = () => router.push('/', "forward", "pop");

    const isValidOrder = storedReference.length > 0 && storedReference === id;

    /**
     * The PayTech flow intentionally leaves the guest cart intact until the
     * payment is confirmed; clear it (and the applied promo) once this
     * success page is reached. No-op for the cash flow, already cleared.
     */
    useEffect(() => {
        if (isValidOrder) {
            clearGuestCart();
            localStorage.removeItem('appliedPromoCode');
            updateBoxes([]);
            updateSlices([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isValidOrder]);
    const passwordsMatch = password.length >= 8 && password === passwordConfirm;

    const submitConversion = async () => {
        if (!passwordsMatch || submitting) return;
        setSubmitting(true);
        try {
            const conversion = await api.post('/convert-guest-order', {
                order_string_id: orderReference,
                password,
                password_confirmation: passwordConfirm,
                app_key: process.env.REACT_APP_KEY
            });

            const token = conversion.data?.token;
            if (!token) {
                throw new Error('Missing token');
            }

            const customer = await api.get('/customer', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const user = customer.data?.user;
            if (user) {
                setId(customer.data.id);
                setUserId(user.id);
                setFirstName(user.first_name);
                setLastName(user.last_name);
                setPhoneNumber(user.phone_number);
                setEmail(user.email);
                setRole(user.role);
                setAvatar(user.avatar);
                setActive(user.active);
                setSessionCount(user.session_count);
                setLogged(true);
                setCreatedAt(user.created_at);

                const user_infos = JSON.stringify({
                    id: customer.data.id,
                    user_id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phone_number: user.phone_number,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    active: user.active,
                    session_count: user.session_count,
                    logged: true,
                    created_at: user.created_at
                });
                localStorage.setItem('token', token);
                localStorage.setItem(token, user_infos);
            }

            showToast(t('Compte créé et commande liée à votre profil'));
            setShowCreateModal(false);
            router.push('/', "forward", "pop");
        }
        catch (err: any) {
            const status = err?.response?.status;
            if (status === 409) {
                showToast(t('Un compte existe déjà avec ce numéro. Veuillez vous connecter.'));
                setShowCreateModal(false);
                router.push('/signin', 'forward', 'push');
            }
            else {
                const msg = err?.response?.data?.message || t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood');
                showToast(msg);
            }
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <IonPage>
            <IonContent id="guestOrderSuccessContent">
            {
                isValidOrder
                ?
                <div className="guest-order-success ion-padding">
                    <div className="d-flex flex-column flex-center">
                        <div className="image-wrapper my-5">
                            <img
                                src={toAbsolutePublicUrl('/media/images/illustrations/lupuorcc.svg')}
                                alt="Illustration"
                            />
                        </div>

                        <div className="d-flex flex-column flex-center">
                            <div className="d-flex flex-row flex-center mb-2">
                                <h1 className="guest-order-success-title title-color font-lg fw-semibold text-center m-0">
                                    {t('Nous vous remercions pour votre commande !')}
                                </h1>
                            </div>

                            <div className="d-flex flex-row flex-center mb-3">
                                <p className="guest-order-success-text font-sm content-color text-center m-0">
                                    {t('Votre commande a été passée avec succès. Votre numéro de commande est')} #{orderReference.substring(0, 12)}
                                </p>
                            </div>

                            <div className="d-flex flex-row flex-center mb-8">
                                <p className="guest-order-info-text font-xs content-color text-center m-0">
                                    {t('Créez un compte pour suivre votre commande et profiter de tous nos services')}
                                </p>
                            </div>

                            <div className="btn-wrapper d-flex flex-column flex-center w-100">
                                <div className="mb-3 w-100">
                                    <IonButton
                                        buttonType="button"
                                        fill="solid"
                                        size="default"
                                        color="primary"
                                        expand="block"
                                        className="text-transform-none"
                                        onClick={() => setShowCreateModal(true)}
                                    >
                                        <span style={{color: '#fff'}}>{t('Créer un compte')}</span>
                                    </IonButton>
                                </div>

                                <div className="w-100">
                                    <IonButton
                                        buttonType="button"
                                        fill="solid"
                                        size="default"
                                        color="light"
                                        expand="block"
                                        className="text-transform-none"
                                        onClick={goToHome}
                                    >
                                        <span>{t('Continuer mes achats')}</span>
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <Error404 />
            }
            </IonContent>

            <IonModal
                isOpen={showCreateModal}
                onDidDismiss={() => setShowCreateModal(false)}
                initialBreakpoint={0.6}
                breakpoints={[0, 0.6, 0.9]}
            >
                <div className="ion-padding">
                    <h2 className="title-color font-md fw-semibold mb-2">
                        {t('Créer un compte à partir de cette commande')}
                    </h2>
                    <IonText color="medium">
                        <p className="font-xs mb-4">
                            {t('Choisissez un mot de passe. Votre numéro de téléphone et votre nom sont déjà sur la commande.')}
                        </p>
                    </IonText>

                    <IonItem className="mb-3">
                        <IonLabel position="stacked">{t('Mot de passe')}</IonLabel>
                        <IonInput
                            type="password"
                            value={password}
                            onIonChange={(e) => setPassword(e.detail.value ?? '')}
                            placeholder={t('Au moins 8 caractères') as string}
                            autocomplete="new-password"
                        />
                    </IonItem>

                    <IonItem className="mb-3">
                        <IonLabel position="stacked">{t('Confirmer le mot de passe')}</IonLabel>
                        <IonInput
                            type="password"
                            value={passwordConfirm}
                            onIonChange={(e) => setPasswordConfirm(e.detail.value ?? '')}
                            placeholder={t('Saisir à nouveau le mot de passe') as string}
                            autocomplete="new-password"
                        />
                        {
                            passwordConfirm.length > 0 && password !== passwordConfirm
                            ? <IonNote slot="error" color="danger">{t('Les mots de passe ne correspondent pas')}</IonNote>
                            : null
                        }
                    </IonItem>

                    <IonButton
                        expand="block"
                        color="primary"
                        disabled={!passwordsMatch || submitting}
                        onClick={submitConversion}
                        className="text-transform-none"
                    >
                        <span style={{color: '#fff'}}>{t('Créer mon compte')}</span>
                    </IonButton>

                    <IonButton
                        expand="block"
                        fill="clear"
                        color="medium"
                        onClick={() => setShowCreateModal(false)}
                        className="text-transform-none mt-2"
                        disabled={submitting}
                    >
                        {t('Annuler')}
                    </IonButton>
                </div>
                <IonLoading isOpen={submitting} message={t('Création du compte...') as string} />
            </IonModal>
        </IonPage>
    );
};

export default GuestOrderSuccess;
