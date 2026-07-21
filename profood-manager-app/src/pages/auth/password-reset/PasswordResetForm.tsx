import React, { useLayoutEffect, useRef, useState } from 'react';

import {
    Button,
    Col,
    FormFeedback,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Row
} from 'reactstrap';
import { Eye, EyeSlash, InfoCircleFill } from 'react-bootstrap-icons';

import { useTranslation } from 'react-i18next';

import api from '../../../api/api';
import useGoToSignIn from '../../../components/hooks/useGoToSignIn';
import useToast from '../../../components/hooks/useToast';
import FormLayout from '../layout/FormLayout';
import { formatPhoneNumber, generatePassword, toAbsolutePublicUrl } from '../../../helpers/AssetHelpers';
import { useLoadingSpinnerContext } from '../../../components/contexts/LoadingSpinnerProvider';
import { useAlertContext } from '../components/contexts/AlertProvider';
import { useThemeModeContext } from '../../../components/contexts/ThemeModeProvider';
import PasswordMeterControl from '../../../components/widgets/PasswordMeterControl';

import './PasswordResetForm.css';

/**
 * 
 * @returns 
 */
const PasswordResetForm: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

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
    const goToSignIn = useGoToSignIn();

    /**
     * 
     */
    const {
        setShowAlert,
        setText: setAlertText,
        setColor: setAlertColor
    } = useAlertContext();

    /**
     * 
     */
    useLayoutEffect(() => {
        setTimeout(() => {
            setShowSpinner(false);
        }, 600);
    }, [setShowSpinner]);

    /**
     * 
     */
    const [phoneNumber, setPhoneNumber] = useState<string>("");
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
    const [isTouchedForPhoneNumber, setIsTouchedForPhoneNumber] = useState(false);
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState<boolean | undefined>(undefined);

    const [isTouchedForPassword, setIsTouchedForPassword] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);

    const [isTouchedForPasswordConfirmation, setIsTouchedForPasswordConfirmation] = useState(false);
    const [isValidPasswordConfirmation, setIsValidPasswordConfirmation] = useState<boolean>(false);

    const [isValidVerificationCode, setIsValidVerificationCode] = useState<boolean>(false);
    const [isTouchedForVerificationCode, setIsTouchedForVerificationCode] = useState<boolean>(false);

    /**
     * 
     * @param _phoneNumber 
     */
    const changePhoneNumber = (_phoneNumber: string) => {
        setPhoneNumber(formatPhoneNumber(_phoneNumber));
        setIsValidPhoneNumber(_phoneNumber.length > 0 &&
            _phoneNumber.match(/(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$/) !== null);
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
     * @param _password 
     */
    const changePasswordConfirmation = (_password: string) => {
        setPasswordConfirmation(_password);
        setIsValidPasswordConfirmation(_password.length > 0 && _password === password);
    };

    /**
     * 
     */
    const passwordFormGroupWrapper = useRef<HTMLDivElement|null>(null);
    const passwordConfirmationFormGroupWrapper = useRef<HTMLDivElement|null>(null);

    // Le reCAPTCHA invisible et l'OTP Firebase ont été retirés : la
    // vérification du code se fait désormais côté serveur.

    /**
     * 
     * @returns 
     */
    const validatePhoneNumber = (): boolean => {
        if(!isValidPhoneNumber){
            setIsTouchedForPhoneNumber(!isValidPhoneNumber);
            return false;
        }
        return true;
    };

    /**
     * 
     * @returns 
     */
    const checkPhoneNumber = () => {

        if(!validatePhoneNumber()) {
            showToast(`${t('Veuillez renseigner le numéro de téléphone')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const data = {
            "phone_number": phoneNumber,
            "app_key": process.env.REACT_APP_KEY
        };
        api.post("/user-phonenumber-exists", data).then((res) => {
            if(res.status !== 200){
                setShowSpinner(false);
                setShowAlert(true);
                setAlertColor('danger');
                setAlertText(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
            }
            else {
                // Le code de vérification est désormais émis et vérifié par le
                // serveur : l'OTP Firebase, contrôlé côté navigateur, ne
                // prouvait rien au serveur qui changeait le mot de passe.
                showToast(t('Un code de confirmation vous a été envoyé'), 'info', {autoClose: 2000});
                setShowOtp(true);
                setShowSpinner(false);
            }
        }).catch((error) => {
            setShowSpinner(false);
            setShowAlert(true);
            setAlertColor('danger');
            setAlertText(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
            console.dir(error);
        });
    };

    /**
     * 
     * @param _code 
     */
    const otpSubmit = (_code: string) => {

        // C'est le serveur, et lui seul, qui décide si le code est valide.
        const data = {
            "app_key": process.env.REACT_APP_KEY,
            "phone_number": phoneNumber,
            "for": "PASSWORD_RESET",
            "code": _code
        };
        api.post("/check-verification-code", data).then(() => {
            setIsValidVerificationCode(true);
            showToast(t('Numéro vérifié avec succès'), 'success', {autoClose: 2000});
            setTimeout(() => {
                setShowPasswordForm(true);
                setShowSpinner(false);
            }, 600);
        }).catch((error: any) => {
            showToast(error.response?.data?.message ? t(error.response.data.message) : `${t('Code invalide')} !`, 'warning', {autoClose: 2000});
            setIsValidVerificationCode(false);
            setIsTouchedForVerificationCode(true);
            setShowSpinner(false);
        });
    };

    /**
     * 
     * @param _code 
     */
    const verifyCode = (_code: string) => {
        setVerificationCode(_code);

        if(_code.length === 6){
            setTimeout(() => {
                setShowSpinner(true);
                otpSubmit(_code);
            }, 600);
        }
    };

    /**
     * 
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidPassword &&
            isValidPasswordConfirmation
        );
    };

    /**
     * 
     * @returns 
     */
    const validateData = (): boolean => {
        if(!isValidData()){
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
    const updatePassword = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        // setShowSpinner(true);
        const data = {
            "phone_number": phoneNumber,
            // Le code saisi est transmis au serveur : c'est lui qui autorise
            // (ou refuse) le changement de mot de passe.
            "code": verificationCode,
            "password": password,
            "password_confirmation": passwordConfirmation,
            "app_key": process.env.REACT_APP_KEY
        };
        api.post("/password-reset", data).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(res.data.message, 'success', {autoClose: 2000});
                setTimeout(() => {
                    setShowSpinner(true);
                    goToSignIn();
                }, 600);
            }
            else{
                setShowAlert(true);
                setAlertColor('danger');
                setAlertText(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
            }
        }).catch((error) => {
            setShowAlert(true);
            setAlertColor('danger');
            setAlertText(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
            console.dir(error);
        });
    };

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    if(!showPasswordForm) {
        if(!showOtp){
            return (
                <FormLayout
                    id='PasswordResetForm'
                    title={t('Réinitialiser le mot de passe')}
                    onSubmit={checkPhoneNumber}
                >
                    <Row className='gx-4 align-items-center'>
                        <Col xs={12}>
                            {/* begin::SubTitle */}
                            <div className="mb-8 px-1">
                                <p className="fw-medium mb-0 text-center">{t("Entrez votre numéro de téléphone ci-dessous et un code vous sera envoyé pour réinitialiser votre mot de passe")}.</p>
                            </div>
                            {/* end::SubTitle */}
                        </Col>
                        <Col xs={12}>
                            <div className={`form-group-wrapper mb-1 ${!isValidPhoneNumber && isTouchedForPhoneNumber ? 'is-invalid' : ''}`}>
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                    <Input
                                        type='tel'
                                        name='phone_number'
                                        id='phoneNumberInput'
                                        placeholder={t('Numéro de téléphone')}
                                        value={phoneNumber}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => changePhoneNumber(e.currentTarget.value)}
                                        onBlur={() => setIsTouchedForPhoneNumber(true)}
                                        invalid={!isValidPhoneNumber && isTouchedForPhoneNumber}
                                        valid={false}
                                    />
                                    <Label for='phoneNumberInput'>{t('Numéro de téléphone')}</Label>
                                </FormGroup>
                                <FormFeedback invalid='true'>{t(!phoneNumber.length ? 'Veuillez renseigner le numéro de téléphone' : 'Numéro de téléphone invalide')}</FormFeedback>
                            </div>
                        </Col>
                        {/* begin::Buttons wrapper */}
                        <Col xs={12}>
                            {/* <div className="d-flex flex-row flex-wrap align-items-center justify-content-end gap-2 pt-4"> */}
                            <div className="d-grid gap-3 mt-4">
                                {/* begin::Submit button */}
                                <Button
                                    tag='button'
                                    type='submit'
                                    className="btn-submit border-0"
                                    // onClick={checkPhoneNumber}
                                >
                                    <span>{t('Soumettre')}</span>
                                </Button>
                                {/* end::Submit button */}
                                {/* begin::Cancel button */}
                                <Button
                                    tag='button'
                                    type='button'
                                    color='secondary'
                                    className="border-0"
                                    onClick={() => goToSignIn()}
                                >
                                    <span>{t('Annuler')}</span>
                                </Button>
                                {/* end::Cancel button */}
                            </div>
                        </Col>
                        {/* end::Buttons wrapper */}
                    </Row>
                </FormLayout>
            );
        }
        else {
            return (
                <FormLayout
                    id='PasswordResetForm'
                    title={t('Réinitialiser le mot de passe')}
                >
                    <Row>
                        <Col xs={12}>
                            {/* begin::Image */}
                            <div className="d-flex flex-column flex-center text-center mb-4">
                                <div className='mb-3'>
                                    <img
                                        src={toAbsolutePublicUrl(`/assets/media/images/illustrations/smartphone${themeMode === 'dark' ? '' : '-dark'}.svg`)}
                                        className='h-120px'
                                        alt={t('Illustration smartphone')}
                                    />
                                </div>
                                <div className='d-flex flex-column flex-center'>
                                    <span className='content-color fw-semibold mb-3'>{t("Entrez le code de vérification que nous avons envoyé au")}</span>
                                    <span className='fw-bold'>{`${phoneNumber.substring(0, 2)} ***** ${phoneNumber.substring(7)}`}</span>
                                </div>
                            </div>
                            {/* end::Image */}
                        </Col>
                        <Col xs={12}>
                            <div className={`form-group-wrapper mb-1 ${!isValidVerificationCode && isTouchedForVerificationCode ? 'is-invalid' : ''}`}>
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                    <Input
                                        type='text'
                                        name='verification_code'
                                        id='verificationCodeInput'
                                        placeholder={t('Code de vérification')}
                                        value={verificationCode}
                                        autoFocus={true}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => verifyCode(e.currentTarget.value)}
                                        onBlur={() => setIsTouchedForVerificationCode(true)}
                                        invalid={!isValidVerificationCode && isTouchedForVerificationCode}
                                        valid={false}
                                    />
                                    <Label for='verificationCodeInput'>{t('Code de vérification')}</Label>
                                </FormGroup>
                                <FormFeedback invalid='true'>{t(!verificationCode.length ? 'Veuillez renseigner le code de vérification' : 'Code invalide')} !</FormFeedback>
                            </div>
                        </Col>
                        <Col xs={12}>
                            <div className="d-flex flex-row flex-wrap flex-center gap-1 text-center">
                                <p className='fs-8 fw-medium mb-0'>{t("Je n'ai pas reçu le code")} ?</p>
                                {/* begin::Submit button */}
                                <Button
                                    tag='button'
                                    type='button'
                                    size='sm'
                                    id='btnReturnVerificationCode'
                                    // className='link-info2 link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover fw-medium px-0'
                                    className='fw-medium px-0'
                                    onClick={checkPhoneNumber}
                                >
                                    <span>{t('Renvoyer')}</span>
                                </Button>
                                {/* end::Submit button */}
                            </div>
                        </Col>
                    </Row>
                </FormLayout>
            );
        }
    }
    else {
        return (
            <FormLayout
                id='PasswordResetForm'
                title={t('Créez un nouveau mot de passe')}
                onSubmit={updatePassword}
            >
                {/* begin::SubTitle */}
                {/* <div className="d-flex flex-column flex-center text-center mt-5 mb-6">
                    <h6 className='fw-semibold'>{t('Créez un nouveau mot de passe')}</h6>
                </div> */}
                {/* end::SubTitle */}
                <Row className='gx-4 align-items-center mb-8'>
                    <Col xs={12}>
                        <div className="notice notice-warning d-flex align-items-center p-5">
                            <div className="notice-icon-wrapper">
                                <InfoCircleFill size={24} />
                            </div>
                            <div>
                                <p className="fs-8 fw-medium mb-0">{t('Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule et une lettre minuscule, un symbole et un chiffre')}.</p>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className='gx-4 gy-2 align-items-center'>
                    <Col xs={12}>
                        <div
                            ref={passwordFormGroupWrapper}
                            className={`form-group-wrapper form-group-password-wrapper mb-0 ${!isValidPassword && isTouchedForPassword ? 'is-invalid' : ''}`}
                        >
                            <InputGroup className="input-group-password">
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                        <Input
                                            type={displayPassword ? "text" : "password"}
                                            name='password'
                                            id='passwordInput'
                                            className='input-group-password-password-input border-end-0'
                                            placeholder={t('Nouveau mot de passe')}
                                            value={password}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changePassword(e.currentTarget.value)}
                                            onBlur={() => {
                                                setIsTouchedForPassword(true);
                                                passwordFormGroupWrapper.current?.classList.remove('focus');
                                            }}
                                            invalid={!isValidPassword && isTouchedForPassword}
                                            valid={false}
                                            onFocus={() => {
                                                passwordFormGroupWrapper.current?.classList.add('focus');
                                            }}
                                        />
                                    <Label for='passwordInput'>{t('Nouveau mot de passe')}</Label>
                                </FormGroup>
                                <InputGroupText
                                    id="passwordVisibilityTogglerWrapper"
                                    className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0"
                                >
                                    <Button
                                        tag='button'
                                        type='button'
                                        size='sm'
                                        color='transparent'
                                        className="password-visibility-toggler"
                                        onClick={() => setDisplayPassword(!displayPassword)}
                                    >
                                    {
                                        displayPassword ? <Eye size={20} /> : <EyeSlash size={20} />
                                    }
                                    </Button>
                                </InputGroupText>
                            </InputGroup>
                            <div className='password-meter-control-wrapper mt-2'>
                                <PasswordMeterControl
                                    inputValue={password}
                                    {...{
                                        inputId:'passwordInput',
                                        minLength: 8
                                    }}
                                />
                            </div>
                            <FormFeedback invalid='true'>{t(!password.length ? 'Veuillez renseigner le nouveau mot de passe' : 'Mot de passe faible')}</FormFeedback>
                        </div>
                    </Col>
                    <Col xs={12}>
                        <div
                            ref={passwordConfirmationFormGroupWrapper}
                            className={`form-group-wrapper form-group-password-wrapper mb-0 ${!isValidPasswordConfirmation && isTouchedForPasswordConfirmation ? 'is-invalid' : ''}`}
                        >
                            <InputGroup className="input-group-password">
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                        <Input
                                            type={displayPasswordConfirmation ? "text" : "password"}
                                            name='password_confirmation'
                                            id='passwordConfirmationInput'
                                            className='input-group-password-password-input border-end-0'
                                            placeholder={t('Confirmer le nouveau mot de passe')}
                                            value={passwordConfirmation}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changePasswordConfirmation(e.currentTarget.value)}
                                            onBlur={() => {
                                                setIsTouchedForPasswordConfirmation(true);
                                                passwordConfirmationFormGroupWrapper.current?.classList.remove('focus');
                                            }}
                                            invalid={!isValidPasswordConfirmation && isTouchedForPasswordConfirmation}
                                            valid={false}
                                            onFocus={() => {
                                                passwordConfirmationFormGroupWrapper.current?.classList.add('focus');
                                            }}
                                        />
                                    <Label for='passwordConfirmationInput'>{t('Confirmer le nouveau mot de passe')}</Label>
                                </FormGroup>
                                <InputGroupText
                                    id="passwordConfirmationVisibilityTogglerWrapper"
                                    className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0"
                                >
                                    <Button
                                        tag='button'
                                        type='button'
                                        size='sm'
                                        color='transparent'
                                        className="password-visibility-toggler"
                                        onClick={() => setDisplayPasswordConfirmation(!displayPasswordConfirmation)}
                                    >
                                    {
                                        displayPasswordConfirmation ? <Eye size={20} /> : <EyeSlash size={20} />
                                    }
                                    </Button>
                                </InputGroupText>
                            </InputGroup>
                            <FormFeedback invalid='true'>{t(!passwordConfirmation.length ? 'Veuillez confirmer le nouveau mot de passe' : 'La confirmation du nouveau mot de passe ne correspond pas')}</FormFeedback>
                        </div>
                    </Col>
                    <Col xs={12}>
                        <div className="d-flex align-items-center justify-content-end mb-2">
                            <Button
                                tag='button'
                                type='button'
                                size='sm'
                                className='rounded-1'
                                style={{fontSize: '13px'}}
                                onClick={() => {
                                    const pass = generatePassword(8);
                                    setPassword(pass);
                                    setIsValidPassword(true);
                                    setIsTouchedForPassword(false);
                                    setPasswordConfirmation(pass);
                                    setIsValidPasswordConfirmation(true);
                                    setIsTouchedForPasswordConfirmation(false);
                                }}
                            >
                                <span>{t('Générer un mot de passe')}</span>
                            </Button>
                        </div>
                    </Col>
                    {/* begin::Submit button */}
                    <Col xs={12}>
                        {/* <div className='d-flex flex-row align-items-center justify-content-end gap-2 pt-4'> */}
                        <div className="d-grid gap-3 mt-4">
                            <Button
                                tag='button'
                                type='submit'
                                className='btn-submit border-0'
                                // onClick={updatePassword}
                            >
                                <span>{t('Mettre à jour')}</span>
                            </Button>
                        </div>
                    </Col>
                    {/* end::Submit button */}
                </Row>
            </FormLayout>
        );
    }
};

export default PasswordResetForm;
