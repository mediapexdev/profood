import React, { useState } from 'react';

import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonIcon,
    IonInput,
    IonLabel,
    IonNote,
    useIonViewDidLeave
} from "@ionic/react";

// import { firebaseAuth } from '../../../firebase';
// import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

import { useTranslation } from 'react-i18next';

import api from '../../../api/api';
import FormLayout from '../layout/FormLayout';
import useToast from '../../../components/hooks/useToast';
import { formatPhoneNumber, toAbsolutePublicUrl } from '../../../helpers/AssetHelpers';
import { useLoadingSpinnerContext } from '../../../contexts/LoadingSpinnerProvider';
import useGoToSignIn from '../../../components/hooks/useGoToSignIn';
import PasswordMeterControl from '../../../components/widgets/PasswordMeterControl';
import { EyeIconString } from '../../../components/icons/svg/Eye';
import { EyeSlashIconString } from '../../../components/icons/svg/EyeSlash';
import { useThemeModeContext } from '../../../contexts/ThemeModeProvider';

import './SignUpForm.css';

/**
 * 
 * @returns 
 */
const SignUpForm: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [showOtp, setShowOtp] = useState<boolean>(false);
    const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);

    /**
     * 
     */
    const [displayPassword, setDisplayPassword] = useState<boolean>(false);
    const [displayPasswordConfirmation, setDisplayPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const [isTouchedForFirstName, setIsTouchedForFirstName] = useState<boolean>(false);
    const [isValidFirstName, setIsValidFirstName] = useState<boolean>(false);

    const [isTouchedForLastName, setIsTouchedForLastName] = useState<boolean>(false);
    const [isValidLastName, setIsValidLastName] = useState<boolean>(false);

    const [isTouchedForPhoneNumber, setIsTouchedForPhoneNumber] = useState<boolean>(false);
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState<boolean>(false);

    const [isTouchedForEmail, setIsTouchedForEmail] = useState<boolean>(false);
    const [isValidEmail, setIsValidEmail] = useState<boolean>(false);

    const [isTouchedForPassword, setIsTouchedForPassword] = useState<boolean>(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);

    const [isTouchedForPasswordConfirmation, setIsTouchedForPasswordConfirmation] = useState<boolean>(false);
    const [isValidPasswordConfirmation, setIsValidPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const clearData = () => {
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
        setVerificationCode("");
        setShowOtp(false);
        setShowPasswordForm(false);
    };

    /**
     * 
     */
    useIonViewDidLeave(() => {
        clearData();
    });

    /**
     * 
     */
    const goToSignIn = useGoToSignIn();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     * @param first_name 
     */
    const changeFirstName = (first_name: string) => {
        setFirstName(first_name);
        setIsValidFirstName(first_name.length > 0);
    };

    /**
     * 
     * @param last_name 
     */
    const changeLastName = (last_name: string) => {
        setLastName(last_name);
        setIsValidLastName(last_name.length > 0);
    };

    /**
     * 
     * @param phone_number 
     */
    const changePhoneNumber = (phone_number: string) => {
        setPhoneNumber(formatPhoneNumber(phone_number));
        setIsValidPhoneNumber(phone_number.length > 0 &&
            phone_number.match(/(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$/) !== null);
    };

    /**
     * 
     * @param _email 
     */
    const changeEmail = (_email: string) => {
        setEmail(_email);
        setIsValidEmail(_email.length > 0 && _email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) !== null);
    };

    /**
     * 
     * @param _password 
     */
    const changePassword = (_password: string) => {
        setPassword(_password);
        setIsValidPassword(_password.length >= 8);
    };
    
    /**
     * 
     * @param password_confirmation 
     */
    const changePasswordConfirmation = (password_confirmation: string) => {
        setPasswordConfirmation(password_confirmation);
        setIsValidPasswordConfirmation(password_confirmation.length > 0 && password_confirmation === password);
    };

    /**
     * 
     */
    // const generateRecaptacha = () => {

    //     if(typeof window.recaptchaVerifier !== 'object' ||
    //             !(window.recaptchaVerifier instanceof RecaptchaVerifier)){
    //         window.recaptchaVerifier = new RecaptchaVerifier(
    //             firebaseAuth,
    //             "signUpRecaptchaContainer",
    //             {
    //                 size: "invisible",
    //                 callback: function (response: string) {
    //                     console.log("Captcha Resolved");
    //                 },
    //                 'expired-callback': () => {
    //                     console.log("Response expired. Ask user to solve reCAPTCHA again.");
    //                 },
    //                 defaultCountry: "SN",
    //             },
    //         );
    //     }
    //     // else{
    //     //     window.recaptchaVerifier.render();
    //     // }
    // };

    /**
     * 
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidFirstName &&
            isValidLastName &&
            isValidPhoneNumber &&
            isValidEmail
        );
    };

    /**
     * 
     * @returns 
     */
    const validateData = (): boolean => {
        if(!isValidData()){
            setIsTouchedForFirstName(!isValidFirstName);
            setIsTouchedForLastName(!isValidLastName);
            setIsTouchedForPhoneNumber(!isValidPhoneNumber);
            setIsTouchedForEmail(!isValidEmail);
            return false;
        }
        return true;
    };

    /**
     * 
     * @returns 
     */
    const checkUserData = () => {

        if(!validateData()) {
            // showToast(`${t('Veuillez remplir tous les champs')} !`);
            return;
        }
        setShowSpinner(true);
        const data = {
            "first_name": firstName,
            "last_name": lastName,
            "email": email,
            "phone_number": phoneNumber,
            "avatar_input_action": "none",
            "app_key": process.env.REACT_APP_KEY
        };
        api.post("/check-user-data-requesting-registration", data).then((res) => {
            if(res.status !== 200){
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            }
            else {
                sessionStorage.setItem('signUpVerificationCode', res.data.code);
                showToast(t("Un code de confirmation vous a été envoyé"));
                setShowOtp(true);
                setShowSpinner(false);

                // generateRecaptacha();
                // // let phone_number = e.target.phone.value;
                // // const appVerifier = window.recaptchaVerifier;
                // const submittedPhone = `+221${phoneNumber.replaceAll(' ', '')}`;

                // signInWithPhoneNumber(firebaseAuth, submittedPhone, window.recaptchaVerifier).then((confirmationResult) => {
                //     // SMS sent. Prompt user to type the code from the message, then sign the
                //     // user in with confirmationResult.confirm(code).
                //     showToast(t("Un code de confirmation vous a été envoyé"));
                //     setShowOtp(true);
                //     setShowSpinner(false);
                //     window.confirmationResult = confirmationResult;
                //     // ...
                // }).catch((error) => {
                //     // Error; SMS not sent
                //     // ...
                //     setShowSpinner(false);
                //     // showToast('Veuilez entrer un format de numéro correct');
                //     showToast(t(error.message));
                //     console.dir(error.message);
                // });
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.dir(error);
        });
    };

    /**
     * 
     * @param _code 
     */
    const otpSubmit = (_code: string) => {

        const verficationCcode = sessionStorage.getItem('signUpVerificationCode');

        if(verficationCcode !== _code){
            showToast(`${t('Code invalide')} !`)
            setShowSpinner(false);
            return;
        }
        showToast(`${t('Numéro vérifié avec succès')} !`)
        setTimeout(() => {
            sessionStorage.removeItem('signUpVerificationCode');
            setShowPasswordForm(true);
            setShowSpinner(false);
        }, 1200);

        // window.confirmationResult.confirm(_code).then((confirmationResult) => {
        //     showToast(`${t('Numéro vérifié avec succès')} !`);
        //     setTimeout(() => {
        //         setShowPasswordForm(true);
        //         setShowSpinner(false);
        //     }, 600);
        //     // window.open("/", "_self");
        // }).catch((error: any) => {
        //     // User couldn't sign in (bad verification code ?)
        //     showToast(`${t('Code invalide')} !`);
        //     setShowSpinner(false);
        //     console.dir(error);
        // });
    };

    /**
     * 
     * @param _code 
     */
    const verifyCode = (_code: string) => {
        setVerificationCode(_code);

        if(_code.length === 6){
            setShowSpinner(true);
            otpSubmit(_code);
        }
    };

    /**
     * 
     * @returns 
     */
    const isValidPasswordAndConfirmation = (): boolean => {
        return (
            isValidPassword &&
            isValidPasswordConfirmation
        );
    };

    /**
     * 
     * @returns 
     */
    const validatePasswordAndConfirmation = (): boolean => {
        if(!isValidPasswordAndConfirmation()){
            setIsTouchedForPassword(!isValidPassword);
            setIsTouchedForPasswordConfirmation(!isValidPasswordConfirmation);
            return false;
        }
        return true;
    };

    /**
     * 
     * @returns 
     */
    const registerUser = () => {

        if(!validatePasswordAndConfirmation()) {
            // showToast(`${t('Veuillez remplir tous les champs')} !`);
            return;
        }
        const data = {
            "first_name": firstName,
            "last_name": lastName,
            "phone_number": phoneNumber,
            "email": email,
            "password": password,
            "password_confirmation": passwordConfirmation,
            "avatar_input_action": "none",
            "app_key": process.env.REACT_APP_KEY
        };
        api.post("/signup", data).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message));
                setTimeout(() => {
                    setShowSpinner(false);
                    clearData();
                    goToSignIn('root', 'pop');
                }, 0);
            }
            else{
                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            }
        }).catch((error) => {
            showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.dir(error);
        });
    };

    if(!showPasswordForm) {
        if(!showOtp){
            return (
                <FormLayout
                    id='signUpForm'
                    title={t("S'inscrire")}
                    titleSize='xxl'
                    onSubmit={checkUserData}
                >
                    {/* begin::Input */}
                    <div className="position-relative input-group mt-8 mb-4">
                        <IonInput
                            type='text'
                            label={t("Prénom")}
                            labelPlacement="floating"
                            aria-label={t("Prénom")}
                            autocomplete='on'
                            fill='solid'
                            className={`form-element content-color ${isValidFirstName && 'ion-valid'} ${!isValidFirstName && 'ion-invalid'} ${isTouchedForFirstName && 'ion-touched'}`}
                            // helperText={t('Veuillez renseigner ce champ')}
                            errorText={t('Veuillez renseigner votre prénom')}
                            value={firstName}
                            onIonBlur={() => setIsTouchedForFirstName(true)}
                            onIonInput={(event) => changeFirstName(event.target.value as string)}
                        />
                    </div>
                    {/* end::Input */}
                    {/* begin::Input */}
                    <div className="position-relative input-group mb-4">
                        <IonInput
                            type='text'
                            label={t("Nom")}
                            labelPlacement="floating"
                            aria-label={t("Nom")}
                            autocomplete='on'
                            fill="solid"
                            // helperText={t('Veuillez renseigner ce champ')}
                            errorText={t('Veuillez renseigner votre nom')}
                            className={`form-element content-color ${isValidLastName && 'ion-valid'} ${!isValidLastName && 'ion-invalid'} ${isTouchedForLastName && 'ion-touched'}`}
                            value={lastName}
                            onIonBlur={() => setIsTouchedForLastName(true)}
                            onIonInput={(event) => changeLastName(event.target.value as string)}
                        />
                    </div>
                    {/* end::Input */}
                    {/* begin::Input */}
                    <div className="position-relative input-group mb-4">
                        <IonInput
                            type='tel'
                            label={t('Numéro de téléphone')}
                            labelPlacement="floating"
                            aria-label={t('Numéro de téléphone')}
                            autocomplete='tel'
                            fill="solid"
                            className={`form-element content-color ${isValidPhoneNumber && 'ion-valid'} ${!isValidPhoneNumber && 'ion-invalid'} ${isTouchedForPhoneNumber && 'ion-touched'}`}
                            // helperText={t('Enter a valid phone number')}
                            errorText={t(!phoneNumber.length ? 'Veuillez renseigner votre numéro de téléphone' : 'Numéro de téléphone invalide')}
                            value={phoneNumber}
                            onIonBlur={() => setIsTouchedForPhoneNumber(true)}
                            onIonInput={(event) => changePhoneNumber(event.target.value as string)}
                        />
                    </div>
                    {/* end::Input */}
                    {/* begin::Input */}
                    <div className="position-relative input-group mb-0">
                        <IonInput
                            type='email'
                            label={t('Adresse e-mail')}
                            labelPlacement="floating"
                            aria-label={t('Adresse e-mail')}
                            autocomplete='email'
                            fill="solid"
                            className={`form-element content-color ${isValidEmail && 'ion-valid'} ${!isValidEmail && 'ion-invalid'} ${isTouchedForEmail && 'ion-touched'}`}
                            // helperText={t('Enter a valid email address')}
                            errorText={t(!email.length ? 'Veuillez renseigner votre adresse e-mail' : 'Adresse e-mail invalide')}
                            value={email}
                            onIonBlur={() => setIsTouchedForEmail(true)}
                            onIonInput={(event) => changeEmail(event.target.value as string)}
                        />
                    </div>
                    {/* end::Input */}
                    {/* begin::Submit button */}
                    <div className="mt-10 mb-5">
                        <IonButton
                            type='submit'
                            buttonType='button'
                            aria-label={t('Soumettre')}
                            fill='solid'
                            size='default'
                            expand="block"
                            className='form-element text-transform-none'
                            onClick={checkUserData}
                        >
                            <span>{t('Soumettre')}</span>
                        </IonButton>
                    </div>
                    {/* end::Submit button */}
                    {/* begin::Sign In */}
                    <div className="d-flex flex-row flex-wrap flex-center text-center mb-3">
                        <IonLabel className='content-color fs-8 me-1'>
                            <span>{t('Vous avez déjà un compte')} ?</span>
                        </IonLabel>
                        <IonButton
                            type='button'
                            buttonType='button'
                            aria-label={t('Se connecter')}
                            fill='clear'
                            size='default'
                            className='btn-go-to-signin form-element fs-8 text-transform-none'
                            onClick={() => goToSignIn('root', 'pop')}
                        >
                            <span>{t('Se connecter')}</span>
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
                    {/* end::Sign In */}
                </FormLayout>
            );
        }
        else {
            return (
                <FormLayout
                    id='signUpForm'
                    title={t("S'inscrire")}
                    titleSize='xxl'
                >
                    {/* begin::Image */}
                    <div className="d-flex flex-column flex-center text-center my-4">
                        <div className='mb-3'>
                            <img
                                src={toAbsolutePublicUrl(`/media/images/illustrations/smartphone${themeMode === 'dark' ? '' : '-dark'}.svg`)}
                                className='h-120px'
                                alt='Illustration smartphone'
                            />
                        </div>
                        <div className='d-flex flex-column flex-center'>
                            <IonLabel className='fw-semibold mb-3'>{t('Entrez le code de vérification que nous avons envoyé au')}</IonLabel>
                            <IonLabel className='fw-bold'>{`${phoneNumber.substring(0, 2)} ***** ${phoneNumber.substring(7)}`}</IonLabel>
                        </div>
                    </div>
                    {/* end::Image */}
                    {/* begin::Input */}
                    <div className="position-relative input-group mb-3">
                        <IonInput
                            type='text'
                            label={t('Code de vérification')}
                            labelPlacement="floating"
                            aria-label={t('Code de vérification')}
                            fill="solid"
                            className="form-element content-color"
                            autoFocus={true}
                            value={verificationCode}
                            onIonInput={(e) => verifyCode(e.target.value as string)}
                        />
                    </div>
                    {/* end::Input */}
                    {/* begin::Footing */}
                    <div className="d-flex flex-row flex-wrap flex-center content-color text-center fs-6 mb-5">
                        <IonLabel className='fs-8 me-1'>
                            <span>{t("Je n'ai pas reçu de code")} ?</span>
                        </IonLabel>
                        {/* begin::Submit button */}
                        <IonButton
                            type='button'
                            buttonType='button'
                            aria-label={t('Renvoyer')}
                            fill='clear'
                            size='default'
                            className='form-element fs-8 text-transform-none'
                            onClick={checkUserData}
                        >
                            <span>{t('Renvoyer')}</span>
                        </IonButton>
                        {/* end::Submit button */}
                    </div>
                    {/* end::Footing */}
                </FormLayout>
            );
        }
    }
    else {
        return (
            <FormLayout
                id='signUpForm'
                title={t("S'inscrire")}
                titleSize='xxl'
                onSubmit={registerUser}
            >
                {/* begin::Subtitle */}
                <div className="d-flex flex-column flex-center text-center my-5">
                    <IonLabel className='fw-semibold'>{t('Créer un mot de passe')}</IonLabel>
                </div>
                {/* end::Subtitle */}
                {/* begin::Input */}
                <div className="position-relative input-group mb-4">
                    <div className='d-flex align-items-start justify-content-center'>
                        <IonInput
                            type={displayPassword ? "text" : "password"}
                            label={t("Mot de passe")}
                            labelPlacement="floating"
                            aria-label={t("Mot de passe")}
                            fill="solid"
                            // helperText={t('Veuillez renseigner ce champ')}
                            errorText={t(!password.length ? 'Veuillez renseigner le mot de passe' : 'Le mot de passe doit comporter au moins 8 caractères')}
                            id='passwordInput'
                            className={`password-input toggleable form-element content-color ${isValidPassword && 'ion-valid'} ${!isValidPassword && 'ion-invalid'} ${isTouchedForPassword && 'ion-touched'}`}
                            value={password}
                            onIonBlur={() => setIsTouchedForPassword(true)}
                            onIonInput={(event) => changePassword(event.target.value as string)}
                        >
                            <div className="password-visibility-toggler-wrapper d-block">
                                <IonButton
                                    type='button'
                                    buttonType='button'
                                    size='small'
                                    fill='clear'
                                    color='medium'
                                    className="password-visibility-toggler text-transform-none"
                                    onClick={() => setDisplayPassword(!displayPassword)}
                                >
                                    <IonIcon
                                        icon={displayPassword ? EyeIconString : EyeSlashIconString }
                                        slot='icon-only'
                                        size='default'
                                    />
                                </IonButton>
                            </div>
                        </IonInput>
                    </div>
                    <div className='password-meter-control-wrapper mt-1'>
                        <PasswordMeterControl
                            inputValue={password}
                            {...{
                                id:'passwordMeterControl',
                                inputId:'passwordInput',
                                minLength: 8
                            }}
                        />
                    </div>
                    <IonNote
                        color='medium'
                        className='ipt-helper-text d-flex'
                    >
                        {t('Utilisez 8 caractères ou plus et si possible avec un mélange de lettres, de chiffres et de symboles')}.
                    </IonNote>
                </div>
                {/* end::Input */}
                {/* begin::Input */}
                <div className="position-relative input-group mb-0">
                    <div className='d-flex align-items-start justify-content-center'>
                        <IonInput
                            type={displayPasswordConfirmation ? "text" : "password"}
                            label={t("Confirmer le mot de passe")}
                            labelPlacement="floating"
                            aria-label={t('Confirmer le mot de passe')}
                            fill="solid"
                            // helperText={t('Veuillez renseigner ce champ')}
                            errorText={t(!passwordConfirmation.length ? 'Veuillez confirmer le mot de passe' : 'La confirmation du mot de passe ne correspond pas')}
                            className={`password-input toggleable form-element content-color ${isValidPasswordConfirmation && 'ion-valid'} ${!isValidPasswordConfirmation && 'ion-invalid'} ${isTouchedForPasswordConfirmation && 'ion-touched'}`}
                            value={passwordConfirmation}
                            onIonBlur={() => setIsTouchedForPasswordConfirmation(true)}
                            onIonInput={(event) => changePasswordConfirmation(event.target.value as string)}
                        >
                            <div className="password-visibility-toggler-wrapper">
                                <IonButton
                                    type='button'
                                    buttonType='button'
                                    size='small'
                                    fill='clear'
                                    color='medium'
                                    className="password-visibility-toggler text-transform-none"
                                    onClick={() => setDisplayPasswordConfirmation(!displayPasswordConfirmation)}
                                >
                                    <IonIcon
                                        icon={displayPasswordConfirmation ? EyeIconString : EyeSlashIconString }
                                        slot='icon-only'
                                        size='default'
                                    />
                                </IonButton>
                            </div>
                        </IonInput>
                    </div>
                </div>
                {/* end::Input */}
                {/* begin::Submit button */}
                <div className="mt-10 mb-5">
                    <IonButton
                        type='submit'
                        buttonType='button'
                        aria-label={t('Soumettre')}
                        fill='solid'
                        size='default'
                        expand="block"
                        className='form-element text-transform-none'
                        onClick={registerUser}
                    >
                        <span>{t('Soumettre')}</span>
                    </IonButton>
                </div>
                {/* end::Submit button */}
            </FormLayout>
        );
    }
};

export default SignUpForm;
