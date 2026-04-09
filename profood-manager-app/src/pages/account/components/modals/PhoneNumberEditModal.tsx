import React, { useEffect, useRef, useState } from "react";

import {
    Button,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";

import { Eye, EyeSlash } from "react-bootstrap-icons";

import { firebaseAuth } from "../../../../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "@firebase/auth";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useToast from "../../../../components/hooks/useToast";
import { useUserInfosContext } from "../contexts/UserInfosProvider";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";
import { formatPhoneNumber, toAbsolutePublicUrl } from "../../../../helpers/AssetHelpers";

import './PasswordEditModal.css';

/**
 * 
 */
export interface PhoneNumberEditModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const PhoneNumberEditModal: React.FC<PhoneNumberEditModalProps> = ({show, setShow, toggle}: PhoneNumberEditModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        userId,
        userPhoneNumber,
        setUserAvatar,
        setUserFirstName,
        setUserLastName,
        setUserPhoneNumber,
        setUserEmail,
        setUserSessionCount
    } = useUserInfosContext();

    /**
     * 
     */
    const [newPhoneNumber, setNewPhoneNumber] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [showOtp, setShowOtp] = useState<boolean>(false);

    /**
     * 
     */
    const [displayPassword, setDisplayPassword] = useState<boolean>(false);

    /**
     * 
     */
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
    const [isTouchedForPassword, setIsTouchedForPassword] = useState<boolean>(false);

    const [isValidNewPhoneNumber, setIsValidNewPhoneNumber] = useState<boolean>(false);
    const [isTouchedForNewPhoneNumber, setIsTouchedForNewPhoneNumber] = useState<boolean>(false);

    const [isValidVerificationCode, setIsValidVerificationCode] = useState<boolean>(false);
    const [isTouchedForVerificationCode, setIsTouchedForVerificationCode] = useState<boolean>(false);

    /**
     * 
     */
    const [reset, setReset] = useState<boolean>(true);

    /**
     * 
     */
    useEffect(() => {
        if(reset){
            setNewPhoneNumber('');
            setIsValidNewPhoneNumber(true);
            setPassword('');
            setIsValidPassword(true);
            setReset(false);
        }
    }, [reset]);

    /**
     * 
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidPassword &&
            isValidNewPhoneNumber
        );
    };

    /**
     * 
     * @returns 
     */
    const validateData = (): boolean => {
        if(!isValidData()){
            setIsTouchedForPassword(!isValidPassword);
            setIsTouchedForNewPhoneNumber(!isValidNewPhoneNumber);
            return false;
        }
        return true;
    };

    /**
     * 
     * @param password 
     */
    const changePassword = (password: string) => {
        setPassword(password);
        setIsValidPassword(password.length >= 6);
    };

    /**
     * 
     * @param phoneNumber 
     */
    const changeNewPhoneNumber = (phoneNumber: string) => {
        setNewPhoneNumber(formatPhoneNumber(phoneNumber));
        setIsValidNewPhoneNumber(phoneNumber.length > 0 &&
            phoneNumber.match(/(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$/) !== null);
    };

    /**
     * 
     */
    const passwordFormGroupWrapper = useRef<HTMLDivElement|null>(null);

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
    const generateRecaptacha = () => {
        
        if(typeof window.recaptchaVerifier !== 'object' ||
                !(window.recaptchaVerifier instanceof RecaptchaVerifier)){
            window.recaptchaVerifier = new RecaptchaVerifier(
                firebaseAuth,
                "recaptchaContainer",
                {
                    size: "invisible",
                    callback: function (response: string) {
                        console.log("Captcha Resolved");
                    },
                    'expired-callback': () => {
                        console.log("Response expired. Ask user to solve reCAPTCHA again.");
                    },
                    defaultCountry: "SN",
                },
            );
        }
        // else{
        //     window.recaptchaVerifier.render();
        // }
    };

    /**
     * 
     * @returns 
     */
    const checkData = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "current_phone_number": userPhoneNumber,
            "password": password,
            "new_phone_number": newPhoneNumber
        };
        api.post("/check-user-data-requesting-change-of-phone-number", data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res) => {
            if(res.status !== 200){
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            }
            else {
                generateRecaptacha();
                // let phone_number = e.target.phone.value;
                // const appVerifier = window.recaptchaVerifier;
                const submittedPhone = `+221${newPhoneNumber.replaceAll(' ', '')}`;

                signInWithPhoneNumber(firebaseAuth, submittedPhone, window.recaptchaVerifier).then((confirmationResult) => {
                    // SMS sent. Prompt user to type the code from the message, then sign the
                    // user in with confirmationResult.confirm(code).
                    showToast(t("Un code de confirmation vous a été envoyé"), 'info', {autoClose: 2000});
                    setShowOtp(true);
                    setShowSpinner(false);
                    window.confirmationResult = confirmationResult;
                    // ...
                }).catch((error) => {
                    // Error; SMS not sent
                    // ...
                    // showToast('Veuilez entrer un format de numéro correct');
                    showToast(error.message ? t(error.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
                    setShowSpinner(false);
                });
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            console.dir(error);
        });
    };

    /**
     * 
     * @returns 
     */
    const updateUserPhoneNumber = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        // setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "user_id": userId,
            "current_phone_number": userPhoneNumber,
            "password": password,
            "new_phone_number": newPhoneNumber
        };
        api.post('/update-phone-number', data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message), 'success', {autoClose: 2000});
                setShow(false);

                api.get('/app-manager', {
                    headers : {
                        Authorization : `Bearer ${token}`,
                    }
                }).then(response => {
                    setUserFirstName(response.data.user.first_name);
                    setUserLastName(response.data.user.last_name);
                    setUserPhoneNumber(response.data.user.phone_number);
                    setUserEmail(response.data.user.email);
                    setUserAvatar(response.data.user.avatar);
                    setUserSessionCount(response.data.user.session_count);
                    const adminInfos = JSON.stringify({
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
                    localStorage.setItem(token as string, adminInfos);
                    setTimeout(() => {
                        setShowSpinner(false);
                    }, 600);
                });
            }
            else{
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            console.dir(error);
        });
    };

    /**
     * 
     * @param _code 
     */
    const otpSubmit = (_code: string) => {

        window.confirmationResult.confirm(_code).then((confirmationResult) => {
            setIsValidVerificationCode(true);
            showToast(`${t('Numéro vérifié avec succès')} !`, 'success', {autoClose: 2000});
            setTimeout(() => {
                // setShowPasswordForm(true);
                // setShowSpinner(false);
                updateUserPhoneNumber();
            }, 600);
            // window.open("/", "_self");
        }).catch((error : any) => {
            // User couldn't sign in (bad verification code?)
            showToast(`${t('Code invalide')} !`, 'warning', {autoClose: 2000});
            setIsValidVerificationCode(false);
            setIsTouchedForVerificationCode(true);
            setShowSpinner(false);
            console.dir(error);
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
     */
    const { themeMode } = useThemeModeContext();

    return (
        <Modal
            id='phoneNumberEditModal'
            isOpen={show}
            toggle={toggle}
            size='lg'
            backdrop='static'
            centered={true}
        >
            <ModalHeader className="flex-center py-4">
                <span className="fs-5">{t('Changer le numéro de téléphone')}</span>
            </ModalHeader>
            <ModalBody className="pt-10 px-10 border-0">
                <Form>
                {
                    !showOtp
                    ?
                    <Row className='gx-4 gy-2 align-items-center'>
                        <Col xs={12}>
                            <div className={`form-group-wrapper mb-1 ${!isValidNewPhoneNumber && isTouchedForNewPhoneNumber ? 'is-invalid' : ''}`}>
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                    <Input
                                        type='tel'
                                        name='new_phone_number'
                                        id='phoneNumberInput'
                                        placeholder={t('Numéro de téléphone')}
                                        value={newPhoneNumber}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => changeNewPhoneNumber(e.currentTarget.value)}
                                        onBlur={() => setIsTouchedForNewPhoneNumber(true)}
                                        invalid={!isValidNewPhoneNumber && isTouchedForNewPhoneNumber}
                                        valid={false}
                                    />
                                    <Label for='phoneNumberInput'>{t('Numéro de téléphone')}</Label>
                                </FormGroup>
                                <FormFeedback invalid='true'>{t(!newPhoneNumber.length ? 'Veuillez renseigner le numéro de téléphone' : 'Numéro de téléphone invalide')}</FormFeedback>
                            </div>
                        </Col>
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
                                            className='border-end-0'
                                            placeholder={t('Mot de passe')}
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
                                        <Label for='passwordInput'>{t('Mot de passe')}</Label>
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
                                <FormFeedback invalid='true'>{t('Veuillez renseigner le mot de passe')}</FormFeedback>
                            </div>
                        </Col>
                    </Row>
                    :
                    <Row>
                        <Col xs={12}>
                            {/* begin::Image */}
                            <div className="d-flex flex-column flex-center text-center my-4">
                                <div className='mb-3'>
                                    <img
                                        src={toAbsolutePublicUrl(`/assets/media/images/illustrations/smartphone${themeMode === 'dark' ? '' : '-dark'}.svg`)}
                                        className='h-120px'
                                        alt={t('Illustration smartphone')}
                                    />
                                </div>
                                <div className='d-flex flex-column flex-center'>
                                    <span className='content-color fw-semibold mb-3'>{t("Entrez le code de vérification que nous avons envoyé au")}</span>
                                    <span className='fw-bold'>{`${newPhoneNumber.substring(0, 2)} ***** ${newPhoneNumber.substring(7)}`}</span>
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
                    </Row>
                }
                </Form>
            </ModalBody>
            <ModalFooter>
                <div className='d-flex flex-row align-items-center justify-content-end gap-2 py-2'>
                {
                    (!showOtp)
                    ?
                    <React.Fragment>
                        <Button
                            tag='button'
                            type='button'
                            color='light'
                            className='border-0'
                            onClick={() => {
                                setShow(false);
                                setReset(true);
                            }}
                        >
                            <span>{t('Annuler')}</span>
                        </Button>
                        <Button
                            tag='button'
                            type='button'
                            color='success'
                            className='border-0'
                            onClick={checkData}
                        >
                            <span>{t('Mettre à jour')}</span>
                        </Button>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        {/* begin::Footing */}
                        <div className="d-flex flex-row flex-wrap flex-center gap-1 text-center">
                            <p className='fs-8 fw-medium mb-0'>{t("Je n'ai pas reçu le code")} ?</p>
                            {/* begin::Submit button */}
                            <Button
                                tag='button'
                                type='button'
                                size='sm'
                                color='transparent'
                                id='btnReturnVerificationCode'
                                // className='link-info2 link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover fw-medium px-0'
                                className='fw-medium px-0'
                                onClick={checkData}
                            >
                                <span>{t('Renvoyer')}</span>
                            </Button>
                            {/* end::Submit button */}
                        </div>
                        {/* end::Footing */}
                    </React.Fragment>
                }
                </div>
                {/* <div id="recaptchaContainer" className={!displayRecaptchaWrapper ? 'v-hidden' : ''}></div> */}
                <div id="recaptchaContainer"></div>
            </ModalFooter>
        </Modal>
    );
};

export default PhoneNumberEditModal;
