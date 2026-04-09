import React, { useEffect, useState } from 'react';

import {
    IonButton,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonNote,
    IonRow,
    useIonViewDidLeave
} from "@ionic/react";

import { useTranslation } from 'react-i18next';

import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { useUserInfosContext } from '../../../../contexts/UserInfosProvider';
import { useUserPasswordEditModalContext } from '../../contexts/UserPasswordEditModalProvider';
import PasswordMeterControl from '../../../../components/widgets/PasswordMeterControl';
import { EyeSlashIconString } from '../../../../components/icons/svg/EyeSlash';
import { EyeIconString } from '../../../../components/icons/svg/Eye';

import './UserPasswordEditForm.css';

/**
 * 
 * @returns 
 */
const UserPasswordEditForm: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

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
    const [isTouchedForCurrentPassword, setIsTouchedForCurrentPassword] = useState<boolean>(false);
    const [isValidCurrentPassword, setIsValidCurrentPassword] = useState<boolean>(false);

    const [isTouchedForNewPassword, setIsTouchedForNewPassword] = useState<boolean>(false);
    const [isValidNewPassword, setIsValidNewPassword] = useState<boolean>(false);

    const [isTouchedForNewPasswordConfirmation, setIsTouchedForNewPasswordConfirmation] = useState<boolean>(false);
    const [isValidNewPasswordConfirmation, setIsValidNewPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     * @param current_password 
     */
    const changeCurrentPassword = (current_password: string) => {
        setCurrentPassword(current_password);
        setIsValidCurrentPassword(current_password.length > 0);
    };

    /**
     * 
     * @param new_password 
     */
    const changeNewPassword = (new_password: string) => {
        setNewPassword(new_password);
        setIsValidNewPassword(new_password.length >= 6);
    };

    /**
     * 
     * @param new_password_confirmation 
     */
    const changeNewPasswordConfirmation = (new_password_confirmation: string) => {
        setNewPasswordConfirmation(new_password_confirmation);
        setIsValidNewPasswordConfirmation(new_password_confirmation.length > 0 && new_password_confirmation === newPassword);
    };

    /**
     * 
     */
    const { phoneNumber } = useUserInfosContext();

    /**
     * 
     */
    useEffect(() => {
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");
    }, []);

    /**
     * 
     */
    const clearData = () => {
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");
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
    const showToast = useToast();

    /**
     * 
     */
    const { setCanDismiss } = useUserPasswordEditModalContext();

    /**
     * 
     */
    const cancelChangePassword = () => {
        setCanDismiss(true);
        setTimeout(() => clearData(), 600);
    };

    /**
     * 
     * @returns 
     */
    const isValidPasswords = (): boolean => {
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
    const validatePasswords = (): boolean => {
        if(!isValidPasswords()){
            setIsTouchedForCurrentPassword(!isValidCurrentPassword);
            setIsTouchedForNewPassword(!isValidNewPassword);
            setIsTouchedForNewPasswordConfirmation(!isValidNewPasswordConfirmation);
            return false;
        }
        return true;
    };

    /**
     * 
     * @returns 
     */
    const changePassword = () => {

        if(!validatePasswords()) {
            // showToast(`${t('Veuillez remplir tous les champs')} !`);
            return;
        }
        const token = localStorage.getItem('token');
        const data = {
            "current_password": currentPassword,
            "new_password": newPassword,
            "new_password_confirmation": newPasswordConfirmation,
            "phone_number": phoneNumber
        };

        api.post('/change-password', data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message));
                setCanDismiss(true);
                setTimeout(() => clearData(), 600);
            }
            else{
                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            }
        }).catch((error) => {
            showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            console.dir(error);
        });
    };

    return (
        <form
            id='userPasswordEditForm'
            className="form w-100"
        >
            <div className='d-flex flex-column mt-1'>
                {/* <div className="d-flex flex-column mb-5">
                    <IonTitle className='title-color font-md'>{t('Changer le mot de passe')}</IonTitle>
                </div> */}
                <IonGrid className='m-0 px-0 pb-0'>
                    <IonRow>
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="position-relative input-group mb-2">
                                <div className='d-flex align-items-start justify-content-center'>
                                    <IonInput
                                        type={displayCurrentPassword ? "text" : "password"}
                                        id='iptCurrentPassword'
                                        label={t("Mot de passe actuel")}
                                        labelPlacement="floating"
                                        aria-label={t("Mot de passe actuel")}
                                        fill="solid"
                                        // helperText={t('Veuillez renseigner ce champ')}
                                        errorText={t('Veuillez renseigner le mot de passe actuel')}
                                        className={`password-input toggleable form-element content-color ${isValidCurrentPassword && 'ion-valid'} ${!isValidCurrentPassword && 'ion-invalid'} ${isTouchedForCurrentPassword && 'ion-touched'}`}
                                        value={currentPassword}
                                        onIonBlur={() => setIsTouchedForCurrentPassword(true)}
                                        onIonInput={(event) => changeCurrentPassword(event.target.value as string)}
                                    >
                                        <div className="password-visibility-toggler-wrapper">
                                            <IonButton
                                                type='button'
                                                buttonType='button'
                                                size='small'
                                                fill='clear'
                                                color='medium'
                                                className="password-visibility-toggler text-transform-none"
                                                onClick={() => setDisplayCurrentPassword(!displayCurrentPassword)}
                                            >
                                                <IonIcon
                                                    icon={displayCurrentPassword ? EyeIconString : EyeSlashIconString }
                                                    slot='icon-only'
                                                    size='default'
                                                />
                                            </IonButton>
                                        </div>
                                    </IonInput>
                                </div>
                            </div>
                        </IonCol>
                        {/*  */}
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="position-relative input-group mb-2">
                                <div className='d-flex align-items-start justify-content-center'>
                                    <IonInput
                                        type={displayNewPassword ? "text" : "password"}
                                        id='iptNewPassword'
                                        label={t('Nouveau mot de passe')}
                                        labelPlacement='floating'
                                        aria-label={t('Nouveau mot de passe')}
                                        fill='solid'
                                        // helperText={t('Veuillez renseigner ce champ')}
                                        errorText={t(!newPassword.length ? 'Veuillez renseigner le nouveau mot de passe' : 'Le mot de passe doit comporter au moins 8 caractères')}
                                        className={`password-input toggleable form-element content-color ${isValidNewPassword && 'ion-valid'} ${!isValidNewPassword && 'ion-invalid'} ${isTouchedForNewPassword && 'ion-touched'}`}
                                        value={newPassword}
                                        onIonBlur={() => setIsTouchedForNewPassword(true)}
                                        onIonInput={(event) => changeNewPassword(event.target.value as string)}
                                    >
                                        <div className="password-visibility-toggler-wrapper">
                                            <IonButton
                                                type='button'
                                                buttonType='button'
                                                size='small'
                                                fill='clear'
                                                color='medium'
                                                className="password-visibility-toggler text-transform-none"
                                                onClick={() => setDisplayNewPassword(!displayNewPassword)}
                                            >
                                                <IonIcon
                                                    icon={displayNewPassword ? EyeIconString : EyeSlashIconString }
                                                    slot='icon-only'
                                                    size='default'
                                                />
                                            </IonButton>
                                        </div>
                                    </IonInput>
                                </div>
                                <div className='password-meter-control-wrapper mt-1'>
                                    <PasswordMeterControl
                                        inputValue={newPassword}
                                        {...{
                                            id:'passwordMeterControl',
                                            inputId:'iptNewPassword',
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
                        </IonCol>
                        {/*  */}
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="position-relative input-group mb-0">
                                <div className='d-flex align-items-start justify-content-center'>
                                    <IonInput
                                        type={displayNewPasswordConfirmation ? "text" : "password"}
                                        id='iptNewPasswordConfirmation'
                                        label={t('Confirmer le nouveau mot de passe')}
                                        labelPlacement="floating"
                                        aria-label={t('Confirmer le nouveau mot de passe')}
                                        fill="solid"
                                        // helperText={t('Veuillez renseigner ce champ')}
                                        errorText={t(!newPasswordConfirmation.length ? 'Veuillez confirmer le nouveau mot de passe' : 'La confirmation du nouveau mot de passe ne correspond pas')}
                                        className={`password-input toggleable form-element content-color ${isValidNewPasswordConfirmation && 'ion-valid'} ${!isValidNewPasswordConfirmation && 'ion-invalid'} ${isTouchedForNewPasswordConfirmation && 'ion-touched'}`}
                                        value={newPasswordConfirmation}
                                        onIonBlur={() => setIsTouchedForNewPasswordConfirmation(true)}
                                        onIonInput={(event) => changeNewPasswordConfirmation(event.target.value as string)}
                                    >
                                        <div className="password-visibility-toggler-wrapper">
                                            <IonButton
                                                type='button'
                                                buttonType='button'
                                                size='small'
                                                fill='clear'
                                                color='medium'
                                                className="password-visibility-toggler text-transform-none"
                                                onClick={() => setDisplayNewPasswordConfirmation(!displayNewPasswordConfirmation)}
                                            >
                                                <IonIcon
                                                    icon={displayNewPasswordConfirmation ? EyeIconString : EyeSlashIconString }
                                                    slot='icon-only'
                                                    size='default'
                                                />
                                            </IonButton>
                                        </div>
                                    </IonInput>
                                </div>
                            </div>
                        </IonCol>
                        {/*  */}
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="btns-wrapper form-btns-wrapper d-flex flex-column mt-8">
                                <IonButton
                                    type='button'
                                    buttonType='button'
                                    aria-label={t("Mettre à jour")}
                                    fill='solid'
                                    size='default'
                                    color='dark'
                                    expand="block"
                                    className='form-element text-transform-none'
                                    onClick={changePassword}
                                >
                                    <span>{t('Mettre à jour')}</span>
                                </IonButton>
                                <IonButton
                                    type='button'
                                    buttonType='button'
                                    aria-label={t("Annuler")}
                                    fill='solid'
                                    size='default'
                                    color='medium'
                                    expand="block"
                                    className='form-element text-transform-none'
                                    onClick={cancelChangePassword}
                                >
                                    <span>{t('Annuler')}</span>
                                </IonButton>
                            </div>
                        </IonCol>
                        {/*  */}
                    </IonRow>
                </IonGrid>
            </div>
        </form>
    );
};

export default UserPasswordEditForm;
