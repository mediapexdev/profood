import React, { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { 
    Button,
    Col,
    FormFeedback,
    FormGroup,
    Label,
    Input,
    InputGroup, 
    InputGroupText,
    Row
} from "reactstrap";

import { Eye, EyeSlash } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import AUTH from "../../services/authentication";
import useGoTo from "../../../../components/hooks/useGoTo";
import useToast from "../../../../components/hooks/useToast";
import { useUserInfosContext } from "../../../account/components/contexts/UserInfosProvider";
import { formatPhoneNumber } from "../../../../helpers/AssetHelpers";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { useAlertContext } from "../../components/contexts/AlertProvider";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import FormLayout from "../../layout/FormLayout";

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
    const [password, setPassword] = useState<string>('');

    /**
     * 
     */
    const [displayPassword, setDisplayPassword] = useState<boolean>(false);

    /**
     * The dash of 8 is put to avoid collusion with data imported from the context.
     */
    const [phoneNumber, setPhoneNumber] = useState<string>('');
 
    /**
     * 
     */
    const [isTouchedForPhoneNumber, setIsTouchedForPhoneNumber] = useState(false);
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState<boolean>(false);

    const [isTouchedForPassword, setIsTouchedForPassword] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);

    /**
     * 
     * @param number 
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
        setIsValidPassword(_password.length > 0);
    };

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const {
        setUserId,
        setUserFirstName,
        setUserLastName,
        setUserPhoneNumber,
        setUserEmail,
        setUserRole,
        setUserAvatar,
        setUserActive,
        setUserLogged,
        setUserSessionCount,
        setUserCreatedAt
    } = useUserInfosContext();

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
    const {
        fetchData
    } = useDataContext();

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
     * @returns 
     */
    const isValidCredentials = (): boolean => {
        return (
            isValidPhoneNumber &&
            isValidPassword
        );
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
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);

        AUTH.login(phoneNumber, password).then((res) => {

            if(res.status === 200 && res.data){
                showToast(t(res.data.message), 'success', { autoClose: 2000 });

                api.get('/app-manager', {
                    headers : {
                        Authorization: `Bearer ${res.data.token}`,
                    }
                }).then(response => {
                    if(response && response.data && response.data.user){
                        setUserId(response.data.user.id);
                        setUserFirstName(response.data.user.first_name);
                        setUserLastName(response.data.user.last_name);
                        setUserPhoneNumber(response.data.user.phone_number);
                        setUserEmail(response.data.user.email);
                        setUserRole(response.data.user.role);
                        setUserAvatar(response.data.user.avatar);
                        setUserActive(response.data.user.active);
                        setUserSessionCount(response.data.user.session_count);
                        setUserLogged(true);
                        setUserCreatedAt(response.data.user.created_at);

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
                        localStorage.setItem('token', res.data.token);
                        localStorage.setItem(res.data.token, adminInfos);
                        fetchData();
                        setTimeout(() => {
                            goTo('/tableau-de-bord');
                            setShowSpinner(false);
                        }, 2000);
                    }
                    else{
                        setAlertText(`${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
                        setShowSpinner(false);
                    }
                }).catch((error) => {
                    // Clear the spinner and surface the error even when the
                    // /app-manager call fails with no HTTP response, otherwise
                    // the user is stuck on an endless loading screen.
                    setShowSpinner(false);
                    setShowAlert(true);
                    setAlertColor('danger');
                    setAlertText(error.response?.data?.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
                    console.dir(error);
                });
            }
            else{
                setShowSpinner(false);
                setShowAlert(true);
                setAlertColor('danger');
                setAlertText(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
                console.log(res);
            }
        })
        .catch((error) => {
            setShowSpinner(false);
            setShowAlert(true);
            setAlertColor('danger');
            setAlertText(error.response?.data?.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`);
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

    /**
     * 
     */
    const passwordFormGroupWrapper = useRef<HTMLDivElement|null>(null);

    return (
        <FormLayout
            id='signinForm'
            title={t('Se connecter')}
            titleSize='xl'
        >
            <div className="mb-6"></div>
            <Row className='gx-4 align-items-center'>
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
                                    placeholder={('Mot de passe')}
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
                                id="singinPasswordVisibilityTogglerWrapper"
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
                <Col xs={12}>
                    <div className="d-flex flex-row flex-wrap align-items-center justify-content-end gap-3 fs-base mb-8">
                        <Link
                            to="/reinitialisation-mot-de-passe"
                            color="none"
                            id="passwordResetLink"
                            // className="fs-8"
                        >
                            <span>{t('Mot de passe oublié')} ?</span>
                        </Link>
                    </div>
                </Col>
                <Col xs={12}>
                    <div className="d-grid">
                        <Button
                            tag='button'
                            type='button'
                            id="btnLogin"
                            className="btn-submit border-0"
                            onClick={logUser}
                        >
                            <span>{t('Connexion')}</span>
                        </Button>
                    </div>
                </Col>
            </Row>
        </FormLayout>
    );
};

export default SignInForm;
