import React, { useEffect, useRef, useState } from "react";

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Row,
    TabContent,
    TabPane
} from "reactstrap";

import { Eye, EyeSlash, InfoCircleFill } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import api from "../../../api/api";
import useToast from "../../../components/hooks/useToast";
import { CustomerProps } from "../../../types";
import { useDataContext } from "../../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../../components/contexts/LoadingSpinnerProvider";
import { useUserInfosContext } from "../../account/components/contexts/UserInfosProvider";
import { generatePassword } from "../../../helpers/AssetHelpers";
import PasswordMeterControl from "../../../components/widgets/PasswordMeterControl";

import './CustomerPasswordEditingFormView.css';

/**
 * 
 * @param customer 
 * @returns 
 */
const CustomerPasswordEditingFormView: React.FC<CustomerProps> = (customer: CustomerProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { fetchCustomers } = useDataContext();

    /**
     * 
     */
    const [password, setPassword] = useState<string>('');
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');

    /**
     * 
     */
    const [displayPassword, setDisplayPassword] = useState<boolean>(false);
    const [displayPasswordConfirmation, setDisplayPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
    const [isTouchedForPassword, setIsTouchedForPassword] = useState<boolean>(false);
    const [isValidPasswordConfirmation, setIsValidPasswordConfirmation] = useState<boolean>(false);
    const [isTouchedForPasswordConfirmation, setIsTouchedForPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const [reset, setReset] = useState<boolean>(false);

    /**
     * 
     */
    useEffect(() => {
        if(reset){
            setPassword('');
            setIsTouchedForPassword(false);
            setPasswordConfirmation('');
            setIsTouchedForPasswordConfirmation(false);
            setReset(false);
        }
    },[reset]);

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
    const { userPhoneNumber: managerPhoneNumber } = useUserInfosContext();

    /**
     * 
     */
    const update = () => {

        changePasswordConfirmation(passwordConfirmation);

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "customer_id": customer.id,
            "admin_phone_number": managerPhoneNumber,
            "password": password,
            "password_confirmation": passwordConfirmation
        };
        api.post('/update-customer-password', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                fetchCustomers();
                showToast(t(res.data.message), 'success', {autoClose: 2000});
                setReset(true);
            }
            else if(res.status === 204){
                showToast(`${t('Aucune modification apportée')} !`, 'info', {autoClose: 2000});
                setShowSpinner(false);
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
     */
    const [showForm, setShowForm] = useState<boolean>(false);

    /**
     * 
     */
    return (
        <Card
            id="customerPasswordEditingFormView"
            className="border-0"
        >
            <CardHeader className="py-5 px-6">
                <div className="d-flex flex-row flex-wrap flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-5 mb-0"
                    >
                        <span>{t('Sécurité')}</span>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardBody className="pt-8 px-6 px-sm-7">
                <TabContent activeTab={`${showForm ? 2 : 1}`}>
                    <TabPane tabId='1'>
                        <div className="d-flex flex-wrap align-items-center mb-10">
                            {/* begin::Label */}
                            <div className="">
                                <div className="fs-8 fw-semibold mb-1">{t('Mot de passe')}</div>
                                <div className="fw-semibold text-gray-600">************</div>
                            </div>
                            {/* end::Label */}
                            {/* begin::Action */}
                            <div className="ms-auto">
                                <Button
                                    tag='button'
                                    type='button'
                                    color='light'
                                    className="fs-7"
                                    onClick={() => setShowForm(true)}
                                >
                                    <span>{t('Réinitialiser le mot de passe')}</span>
                                </Button>
                            </div>
                            {/* end::Action */}
                        </div>
                    </TabPane>
                    <TabPane tabId='2'>
                        <Form>
                            <Row className='gx-4 align-items-center'>
                                <Col xl={6}>
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
                                        <div className='password-meter-control-wrapper mt-2'>
                                            <PasswordMeterControl
                                                inputValue={password}
                                                {...{
                                                    inputId:'passwordInput',
                                                    minLength: 8
                                                }}
                                            />
                                        </div>
                                        <FormFeedback invalid='true'>{t(!password.length ? 'Veuillez renseigner le mot de passe' : 'Mot de passe faible')} !</FormFeedback>
                                    </div>
                                </Col>
                                <Col xl={6}>
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
                                                    placeholder={t('Confirmer le mot de passe')}
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
                                                <Label for='passwordConfirmationInput'>{t('Confirmer le mot de passe')}</Label>
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
                                        <div className='d-none d-xl-flex align-items-center mt-2 h-5px'></div>
                                        <FormFeedback invalid='true'>{t(!passwordConfirmation.length ? 'Veuillez confirmer le nouveau mot de passe' : 'La confirmation du mot de passe ne correspond pas')}</FormFeedback>
                                    </div>
                                </Col>
                            </Row>
                            <Row className='gx-4 align-items-center my-4'>
                                <Col xs={12}>
                                    <div className="d-flex flex-center">
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            className='rounded-1'
                                            style={{fontSize: '13px'}}
                                            onClick={() => {
                                                const pass = generatePassword(10);
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
                            </Row>
                            <Row className='gx-4 align-items-center mt-8 mb-4'>
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
                        </Form>
                    </TabPane>
                </TabContent>
            </CardBody>
        {
            showForm &&
            <CardFooter className="">
                <div className='d-flex flex-row align-items-center justify-content-end gap-2 py-3 pb-2'>
                    <Button
                        tag='button'
                        type='button'
                        color='light'
                        className='border-0'
                        onClick={() => {
                            setShowForm(false);
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
                        onClick={update}
                    >
                        <span>{t('Enregistrer')}</span>
                    </Button>
                </div>
            </CardFooter>
        }
        </Card>
    );
};

export default CustomerPasswordEditingFormView;
