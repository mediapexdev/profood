import React, { useState } from "react";

import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonInput,
    IonLabel,
    useIonRouter,
    useIonViewDidEnter,
    useIonViewDidLeave
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import api from "../../../api/api";
import AUTH from "../services/authentication";
import useToast from "../../../components/hooks/useToast";
import FormLayout from "../layout/FormLayout";
import { useUserInfosContext } from "../../../contexts/UserInfosProvider";
import { formatPhoneNumber } from "../../../helpers/AssetHelpers";
import { useLoadingSpinnerContext } from "../../../contexts/LoadingSpinnerProvider";
import useGoToSignUp from "../../../components/hooks/useGoToSignUp";

import './SignInForm.css';

/**
 * 
 * @returns 
 */
const SignInForm: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [password, setPassword] = useState<string>("");

    /**
     * 
     */
    const [displayPassword, setDisplayPassword] = useState<boolean>(false);

    /**
     * The dash of 8 is put to avoid collusion with data imported from the context.
     */
    const [_phoneNumber, _setPhoneNumber] = useState<string>("");
 
    /**
     * 
     */
    const [isTouchedForPhoneNumber, setIsTouchedForPhoneNumber] = useState<boolean>(false);
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState<boolean>(false);
    const [isTouchedForPassword, setIsTouchedForPassword] = useState<boolean>(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);

    /**
     * 
     * @param phoneNumber 
     */
    const changePhoneNumber = (phoneNumber: string) => {
        _setPhoneNumber(formatPhoneNumber(phoneNumber));
        setIsValidPhoneNumber(phoneNumber.length > 0 &&
            phoneNumber.match(/(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$/) !== null);
    };

    /**
     * 
     * @param _password 
     */
    const changePassword = (_password: string) => {
        setPassword(_password);
        setIsValidPassword(_password.length > 0);
    };

    /**
     * 
     */
    const clearData = () => {
        setPassword("");
        _setPhoneNumber("");
    };

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    useIonViewDidEnter(() => {
        setTimeout(() => {
            setShowSpinner(false);
        }, 600);
    });

    /**
     * 
     */
    useIonViewDidLeave(() => {
        clearData();
    });

    /**
     * 
     */
    const goToSignUp = useGoToSignUp();

    /**
     * 
     */
    const navigate = useIonRouter();

    /**
     * 
     */
    const goToPasswordReset = () => {
        navigate.push("/password-reset", 'root', 'push');
    };

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
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

    /**
     * 
     */
    // const { fetchData } = useCartContext();

    /**
     * 
     * @returns 
     */
    const isValidCredentials = (): boolean => {
        return (isValidPhoneNumber && isValidPassword);
    };

    /**
     * 
     * @returns 
     */
    const validateCredentials = (): boolean => {
        if(!isValidCredentials()){
            setIsTouchedForPhoneNumber(!isValidPhoneNumber);
            setIsTouchedForPassword(!isValidPassword);
            return false;
        }
        return true;
    };

    /**
     * 
     * @returns 
     */
    const logUser = () => {

        if(!validateCredentials()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`);
            return;
        }
        setShowSpinner(true);

        AUTH.login(_phoneNumber, password).then((res) => {

            if(res.status === 200 && res.data){
                showToast(t(res.data.message));

                api.get('/customer', {
                    headers: {
                        Authorization: `Bearer ${res.data.token}`,
                    }
                }).then(response => {
                    if(response && response.data && response.data.user){
                        setId(response.data.id);
                        setUserId(response.data.user.id);
                        setFirstName(response.data.user.first_name);
                        setLastName(response.data.user.last_name);
                        setPhoneNumber(response.data.user.phone_number);
                        setEmail(response.data.user.email);
                        setRole(response.data.user.role);
                        setAvatar(response.data.user.avatar);
                        setActive(response.data.user.active);
                        setSessionCount(response.data.user.session_count);
                        setLogged(true);
                        setCreatedAt(response.data.user.created_at);

                        const user_infos = JSON.stringify({
                            id: response.data.id,
                            user_id: response.data.user.id,
                            first_name: response.data.user.first_name,
                            last_name: response.data.user.last_name,
                            phone_number: response.data.user.phone_number,
                            email: response.data.user.email,
                            role: response.data.user.role,
                            avatar: response.data.user.avatar,
                            active: response.data.user.active,
                            session_count: response.data.user.session_count,
                            logged: true,
                            created_at: response.data.user.created_at
                        });
                        clearData();
                        localStorage.setItem('token', res.data.token);
                        localStorage.setItem(res.data.token, user_infos);
                        // fetchData();
                        // navigate.goBack();
                        setTimeout(() => {
                            setShowSpinner(false);
                            navigate.goBack();
                        }, 600);
                    }
                    else{
                        showToast(`${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                        setShowSpinner(false);
                    }
                }).catch((error) => {
                    // Clear the spinner even when /customer fails with no HTTP
                    // response, otherwise the user is stuck on a loading screen.
                    setShowSpinner(false);
                    showToast(error.response?.data?.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                    console.dir(error);
                });
            }
            else{
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            }
        })
        .catch((error) => {
            // Optional chaining so a network error (no error.response) still shows
            // a message instead of throwing inside the handler (silent failure).
            setShowSpinner(false);
            showToast(error.response?.data?.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.log(error);
        });
    };
    // Notification.requestPermission().then((permission) => {
    //     if (permission === 'granted') {
    //       console.log('Notification permission granted.');}})

    // const messaging = getMessaging();

    // getToken(messaging, { vapidKey: 'BGVqEG3t8h_47kPXhcDaxZPMQiDo3mFuMEzyIB8YFAan6UKrRUb4mlqCE9y1sFMuDNAvGN2Dog7IZxg6OiKtEsU' }).then((currentToken) => {
    //     if (currentToken) {
    //         // Send the token to your server and update the UI if necessary
    //         // ...
    //         console.log(currentToken);
    //     } else {
    //         // Show permission request UI
    //         console.log('No registration token available. Request permission to generate one.');
    //         // ...
    //     }
    // }).catch((err) => {
    //     console.log('An error occurred while retrieving token. ', err);
    //     // ...
    // });

    return (
        <FormLayout 
            id='signInForm'
            title={t('Se connecter')}
            titleSize='xl'
            // onSubmit={logUser}
        >
            <div className="position-relative input-group mt-8 mb-4">
                <IonInput
                    type="tel"
                    mode='md'
                    label={t("Numéro de téléphone")}
                    labelPlacement="floating"
                    aria-label={t("Numéro de téléphone")}
                    fill='solid'
                    className={`form-element content-color ${isValidPhoneNumber && 'ion-valid'} ${!isValidPhoneNumber && 'ion-invalid'} ${isTouchedForPhoneNumber && 'ion-touched'}`}
                    // helperText={t('Enter a valid phone number')}
                    errorText={t(!_phoneNumber.length ? 'Veuillez renseigner le numéro de téléphone' : 'Numéro de téléphone invalide')}
                    autocomplete='on'
                    value={_phoneNumber}
                    onIonBlur={() => setIsTouchedForPhoneNumber(true)}
                    onIonInput={(event) => changePhoneNumber(event.target.value as string)}
                />
            </div>
            <div className="position-relative input-group mb-0">
                <IonInput
                    type={displayPassword ? "text" : "password"}
                    mode='md'
                    label={t("Mot de passe")}
                    labelPlacement="floating"
                    aria-label={t("Mot de passe")}
                    fill='solid'
                    className={`password-input form-element content-color ${isValidPassword && 'ion-valid'} ${!isValidPassword && 'ion-invalid'} ${isTouchedForPassword && 'ion-touched'}`}
                    errorText={t('Veuillez renseigner le mot de passe')}
                    value={password}
                    onIonBlur={() => setIsTouchedForPassword(true)}
                    onIonInput={(event) => changePassword(event.target.value as string)}
                />
                <div className="password-visibility-toggler-wrapper pt-2 mb-4">
                    <IonCheckbox
                        labelPlacement='end'
                        color='dark'
                        checked={displayPassword}
                        onIonChange={() => setDisplayPassword(!displayPassword)}
                    >
                        {t('Afficher le mot de passe')}
                    </IonCheckbox>
                    <IonButton
                        type='button'
                        buttonType='button'
                        fill='clear'
                        size='default'
                        className='form-element fs-8 text-transform-none'
                        onClick={goToPasswordReset}
                    >
                        <span>{t('Mot de passe oublié')} ?</span>
                    </IonButton>
                </div>
            </div>
            <div className="d-flex flex-column mb-3">
                <IonButton
                    type='submit'
                    buttonType='button'
                    aria-label={t('Connexion')}
                    fill='solid'
                    size='default'
                    expand='block'
                    className='form-element text-transform-none'
                    onClick={logUser}
                >
                    <span>{t('Connexion')}</span>
                </IonButton>
            </div>
            <div className="d-flex flex-row flex-wrap flex-center text-center mb-1">
                <IonLabel className="content-color fs-8 me-1">
                    <span>{t('Nouveau sur Profood')} ?</span>
                </IonLabel>
                <IonButton
                    type='button'
                    buttonType='button'
                    fill='clear'
                    aria-label={t("S'inscrire")}
                    size='default'
                    className='btn-go-to-signup form-element fs-8 text-transform-none'
                    onClick={() => goToSignUp('root', 'push')}
                >
                    <span>{t("S'inscrire")}</span>
                </IonButton>
                {/* begin::Back button */}
                <IonButtons className="mt-2 w-100 d-flex flex-center">
                    <IonBackButton
                        defaultHref='/'
                        // text={t('Retour')}
                        // className="text-transform-none font-medium"
                    />
                </IonButtons>
                {/* end::Back button */}
            </div>
        </FormLayout>
    );
};

export default SignInForm;
