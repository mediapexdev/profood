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

import { Eye, EyeSlash, InfoCircleFill } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useToast from "../../../../components/hooks/useToast";
import { useUserInfosContext } from "../contexts/UserInfosProvider";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { generatePassword } from "../../../../helpers/AssetHelpers";
import PasswordMeterControl from "../../../../components/widgets/PasswordMeterControl";

import './PasswordEditModal.css';

/**
 * 
 */
export interface PasswordEditModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const PasswordEditModal: React.FC<PasswordEditModalProps> = ({show, setShow, toggle}: PasswordEditModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        userId,
        userPhoneNumber
    } = useUserInfosContext();

    /**
     * 
     */
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<string>("");

    /**
     * 
     */
    const [displayCurrentPassword, setDisplayCurrentPassword] = useState<boolean>(false);
    const [displayNewPassword, setDisplayNewPassword] = useState<boolean>(false);
    const [displayNewPasswordConfirmation, setDisplayNewPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const [isValidCurrentPassword, setIsValidCurrentPassword] = useState<boolean>(false);
    const [isTouchedForCurrentPassword, setIsTouchedForCurrentPassword] = useState<boolean>(false);

    const [isValidNewPassword, setIsValidNewPassword] = useState<boolean>(false);
    const [isTouchedForNewPassword, setIsTouchedForNewPassword] = useState<boolean>(false);

    const [isValidNewPasswordConfirmation, setIsValidNewPasswordConfirmation] = useState<boolean>(false);
    const [isTouchedForNewPasswordConfirmation, setIsTouchedForNewPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const [reset, setReset] = useState<boolean>(true);

    /**
     * 
     */
    useEffect(() => {
        if(reset){
            setCurrentPassword('');
            setIsValidCurrentPassword(true);
            setNewPassword('');
            setIsValidNewPassword(true);
            setNewPasswordConfirmation('');
            setIsValidNewPasswordConfirmation(true);
            setReset(false);
        }
    }, [reset]);

    /**
     * 
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidCurrentPassword &&
            isValidNewPassword &&
            isValidNewPasswordConfirmation
        );
    };

    /**
     * 
     * @returns 
     */
    const validateData = (): boolean => {
        if(!isValidData()){
            setIsTouchedForCurrentPassword(!isValidCurrentPassword);
            setIsTouchedForNewPassword(!isValidNewPassword);
            setIsTouchedForNewPasswordConfirmation(!isValidNewPasswordConfirmation);
            return false;
        }
        return true;
    };

    /**
     * 
     * @param password 
     */
    const changeCurrentPassword = (password: string) => {
        setCurrentPassword(password);
        setIsValidCurrentPassword(password.length > 0);
    };

    /**
     * 
     * @param password 
     */
    const changeNewPassword = (password: string) => {
        setNewPassword(password);
        setIsValidNewPassword(password.length >= 8);
    };

    /**
     * 
     * @param password 
     */
    const changeNewPasswordConfirmation = (password: string) => {
        setNewPasswordConfirmation(password);
        setIsValidNewPasswordConfirmation(password.length > 0 && password === newPassword);
    };

    /**
     * 
     */
    const currentPasswordFormGroupWrapper = useRef<HTMLDivElement|null>(null);
    const newPasswordFormGroupWrapper = useRef<HTMLDivElement|null>(null);
    const newPasswordConfirmationFormGroupWrapper = useRef<HTMLDivElement|null>(null);

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
     * @returns 
     */
    const changePassword = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "user_id": userId,
            "phone_number": userPhoneNumber,
            "current_password": currentPassword,
            "new_password": newPassword,
            "new_password_confirmation": newPasswordConfirmation
        };
        api.post('/update-user-password', data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message), 'success', {autoClose: 2000});
                setShow(false);
                setTimeout(() => {
                    setShowSpinner(false);
                }, 600);
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

    return (
        <Modal
            id='passwordEditModal'
            isOpen={show}
            toggle={toggle}
            size='lg'
            backdrop='static'
            centered={true}
        >
            <ModalHeader className="flex-center py-5">{t('Réinitialiser le mot de passe')}</ModalHeader>
            <ModalBody className="px-10">
                <Form>
                    <Row className='gx-4 align-items-center mb-10'>
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
                                ref={currentPasswordFormGroupWrapper}
                                className={`form-group-wrapper form-group-password-wrapper mb-0 ${!isValidCurrentPassword && isTouchedForCurrentPassword ? 'is-invalid' : ''}`}
                            >
                                <InputGroup className="input-group-password">
                                    <FormGroup
                                        floating={true}
                                        className='form-group mb-0'
                                    >
                                        <Input
                                            type={displayCurrentPassword ? "text" : "password"}
                                            name='current_password'
                                            id='currentPasswordInput'
                                            className='input-group-password-password-input border-end-0'
                                            placeholder={t('Mot de passe actuel')}
                                            value={currentPassword}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changeCurrentPassword(e.currentTarget.value)}
                                            onBlur={() => {
                                                setIsTouchedForCurrentPassword(true);
                                                currentPasswordFormGroupWrapper.current?.classList.remove('focus');
                                            }}
                                            invalid={!isValidCurrentPassword && isTouchedForCurrentPassword}
                                            valid={false}
                                            onFocus={() => {
                                                currentPasswordFormGroupWrapper.current?.classList.add('focus');
                                            }}
                                        />
                                        <Label for='currentPasswordInput'>{t('Mot de passe actuel')}</Label>
                                    </FormGroup>
                                    <InputGroupText
                                        id="currentPasswordVisibilityTogglerWrapper"
                                        className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0"
                                    >
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='transparent'
                                            className="password-visibility-toggler"
                                            onClick={() => setDisplayCurrentPassword(!displayCurrentPassword)}
                                        >
                                        {
                                            displayCurrentPassword ? <Eye size={20} /> : <EyeSlash size={20} />
                                        }
                                        </Button>
                                    </InputGroupText>
                                </InputGroup>
                                <FormFeedback invalid='true'>{t('Veuillez renseigner le mot de passe')}</FormFeedback>
                            </div>
                        </Col>
                        <Col xs={12}>
                            <div
                                ref={newPasswordFormGroupWrapper}
                                className={`form-group-wrapper form-group-password-wrapper mb-0 ${!isValidNewPassword && isTouchedForNewPassword ? 'is-invalid' : ''}`}
                            >
                                <InputGroup className="input-group-password">
                                    <FormGroup
                                        floating={true}
                                        className='form-group mb-0'
                                    >
                                        <Input
                                            type={displayNewPassword ? "text" : "password"}
                                            name='new_password'
                                            id='newPasswordInput'
                                            className='input-group-password-password-input border-end-0'
                                            placeholder={t('Nouveau mot de passe')}
                                            value={newPassword}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changeNewPassword(e.currentTarget.value)}
                                            onBlur={() => {
                                                setIsTouchedForNewPassword(true);
                                                newPasswordFormGroupWrapper.current?.classList.remove('focus');
                                            }}
                                            invalid={!isValidNewPassword && isTouchedForNewPassword}
                                            valid={false}
                                            onFocus={() => {
                                                newPasswordFormGroupWrapper.current?.classList.add('focus');
                                            }}
                                        />
                                        <Label for='newPasswordInput'>{t('Nouveau mot de passe')}</Label>
                                    </FormGroup>
                                    <InputGroupText
                                        id="newPasswordVisibilityTogglerWrapper"
                                        className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0"
                                    >
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='transparent'
                                            className="password-visibility-toggler"
                                            onClick={() => setDisplayNewPassword(!displayNewPassword)}
                                        >
                                        {
                                            displayNewPassword ? <Eye size={20} /> : <EyeSlash size={20} />
                                        }
                                        </Button>
                                    </InputGroupText>
                                </InputGroup>
                                <div className='password-meter-control-wrapper mt-2'>
                                    <PasswordMeterControl
                                        inputValue={newPassword}
                                        {...{
                                            inputId:'newPasswordInput',
                                            minLength: 8
                                        }}
                                    />
                                </div>
                                <FormFeedback invalid='true'>{t(!newPassword.length ? 'Veuillez renseigner le nouveau mot de passe' : 'Mot de passe faible')}</FormFeedback>
                            </div>
                        </Col>
                        <Col xs={12}>
                            <div
                                ref={newPasswordConfirmationFormGroupWrapper}
                                className={`form-group-wrapper form-group-password-wrapper mb-0 ${!isValidNewPasswordConfirmation && isTouchedForNewPasswordConfirmation ? 'is-invalid' : ''}`}
                            >
                                <InputGroup className="input-group-password">
                                    <FormGroup
                                        floating={true}
                                        className='form-group mb-0'
                                    >
                                        <Input
                                            type={displayNewPasswordConfirmation ? "text" : "password"}
                                            name='new_password_confirmation'
                                            id='newPasswordConfirmationInput'
                                            className='input-group-password-password-input border-end-0'
                                            placeholder={t('Confirmer le nouveau mot de passe')}
                                            value={newPasswordConfirmation}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changeNewPasswordConfirmation(e.currentTarget.value)}
                                            onBlur={() => {
                                                setIsTouchedForNewPasswordConfirmation(true);
                                                newPasswordConfirmationFormGroupWrapper.current?.classList.remove('focus');
                                            }}
                                            invalid={!isValidNewPasswordConfirmation && isTouchedForNewPasswordConfirmation}
                                            valid={false}
                                            onFocus={() => {
                                                newPasswordConfirmationFormGroupWrapper.current?.classList.add('focus');
                                            }}
                                        />
                                        <Label for='newPasswordConfirmationInput'>{t('Confirmer le nouveau mot de passe')}</Label>
                                    </FormGroup>
                                    <InputGroupText
                                        id="newPasswordConfirmationVisibilityTogglerWrapper"
                                        className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0"
                                    >
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='transparent'
                                            className="password-visibility-toggler"
                                            onClick={() => setDisplayNewPasswordConfirmation(!displayNewPasswordConfirmation)}
                                        >
                                        {
                                            displayNewPasswordConfirmation ? <Eye size={20} /> : <EyeSlash size={20} />
                                        }
                                        </Button>
                                    </InputGroupText>
                                </InputGroup>
                                <FormFeedback invalid='true'>{t(!newPasswordConfirmation.length ? 'Veuillez confirmer le nouveau mot de passe' : 'La confirmation du nouveau mot de passe ne correspond pas')}</FormFeedback>
                            </div>
                        </Col>
                    </Row>
                    <Row className='gx-4 align-items-center my-2'>
                        <Col xs={12}>
                            <div className="d-flex flex-center">
                                <Button
                                    tag='button'
                                    type='button'
                                    size='sm'
                                    className='rounded-1'
                                    style={{fontSize: '13px'}}
                                    onClick={() => {
                                        const pass = generatePassword(8);
                                        setNewPassword(pass);
                                        setIsValidNewPassword(true);
                                        setIsTouchedForNewPassword(false);
                                        setNewPasswordConfirmation(pass);
                                        setIsValidNewPasswordConfirmation(true);
                                        setIsTouchedForNewPasswordConfirmation(false);
                                    }}
                                >
                                    <span>{t('Générer un mot de passe')}</span>
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </ModalBody>
            <ModalFooter>
                <div className='d-flex flex-row align-items-center justify-content-end gap-2 py-2'>
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
                        onClick={changePassword}
                    >
                        <span>{t('Mettre à jour')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default PasswordEditModal;
