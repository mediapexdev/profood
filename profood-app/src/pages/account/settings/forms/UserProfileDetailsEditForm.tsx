import React, { useEffect, useState } from 'react';

import {
    IonAvatar,
    IonButton,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonLabel,
    IonNote,
    IonRow,
    useIonViewDidLeave
} from "@ionic/react";
import { close } from 'ionicons/icons';

import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { toAbsolutePublicUrl } from '../../../../helpers/AssetHelpers';
import { useUserInfosContext } from '../../../../contexts/UserInfosProvider';
import { useUserProfileDetailsEditModalContext } from '../../contexts/UserProfileDetailsEditModalProvider';
import { PencilIconString } from '../../../../components/icons/svg/PencilIcon';
import { useTranslation } from 'react-i18next';
import { useThemeModeContext } from '../../../../contexts/ThemeModeProvider';

import './UserProfileDetailsEditForm.css';

/**
 * 
 */
type AvatarInputAction = 'change' | 'remove' | 'none';

/**
 * 
 * @returns 
 */
const UserProfileDetailsEditForm: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [ufirstName, setUFirstName] = useState<string>("");
    const [ulastName, setULastName] = useState<string>("");
    const [uemail, setUEmail] = useState<string>("");
    const [uavatar, setUAvatar] = useState<any>(undefined);
    const [preview, setPreview] = useState<any>(undefined);
    const [avatarInputAction, setAvatarInputAction] = useState<AvatarInputAction>('none');
    const [selectedFile, setselectedFile] = useState<boolean>(false);

    /**
     * 
     */
    const [isTouchedForFirstName, setIsTouchedForFirstName] = useState<boolean>(false);
    const [isValidFirstName, setIsValidFirstName] = useState<boolean>(true);
    const [isTouchedForLastName, setIsTouchedForLastName] = useState<boolean>(false);
    const [isValidLastName, setIsValidLastName] = useState<boolean>(true);
    const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
    const [isTouchedForEmail, setIsTouchedForEmail] = useState<boolean>(false);

    /**
     * 
     * @param first_name 
     */
    const changeFirstName = (first_name: string) => {
        setUFirstName(first_name);
        setIsValidFirstName(first_name.length > 0);
    };

    /**
     * 
     * @param last_name 
     */
    const changeLastName = (last_name: string) => {
        setULastName(last_name);
        setIsValidLastName(last_name.length > 0);
    };

    /**
     * 
     * @param _email 
     */
    const changeEmail = (_email: string) => {
        setUEmail(_email);
        // L'e-mail est facultatif : un champ vide est valide, mais une
        // saisie non vide doit rester un e-mail correct.
        setIsValidEmail(_email.length === 0 || _email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) !== null);
    };

    /**
     * 
     */
    const {
        firstName,
        lastName,
        phoneNumber,
        email,
        avatar,
        setId,
        setUserId,
        setFirstName,
        setLastName,
        setPhoneNumber,
        setEmail,
        setRole,
        setAvatar,
        setLogged,
        setSessionCount
    } = useUserInfosContext();

    /**
     * 
     */
    useEffect(() => {
        setUFirstName(firstName);
        setULastName(lastName);
        setUEmail(email ?? "");
        // setUAvatar(avatar);
        setPreview(avatar);
    }, []);

    /**
     * 
     */
    const clearData = () => {
        setUFirstName("");
        setULastName("");
        setUEmail("");
        setUAvatar(undefined);
        setPreview(undefined);
        setAvatarInputAction('none');
    };

    /**
     * 
     */
    useIonViewDidLeave(() => {
        clearData();
    });

    /**
     * Crée un aperçu comme effet secondaire, chaque fois que le fichier sélectionné est modifié
     */
    useEffect(() => {
        if (!uavatar) {
            // setPreview(undefined);
            return;
        }
        const objectUrl = URL.createObjectURL(uavatar);
        setPreview(objectUrl);

        // libérer la mémoire chaque fois que ce composant est démonté
        return () => URL.revokeObjectURL(objectUrl);
    }, [uavatar]);

    /**
     * 
     * @param event 
     * @returns 
     */
    const handleFileSelect = (event: any) => {
        if (!event.target.files || event.target.files.length === 0) {
            setUAvatar(undefined);
            return;
        }
        setUAvatar(event.target.files[0]);
        setselectedFile(true);
    };

    /**
     * 
     * @param action 
     */
    const handleAvatarInputAction = (action: AvatarInputAction) => {
        setAvatarInputAction(action);
    };

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { setCanDismiss } = useUserProfileDetailsEditModalContext();

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    const cancelUpdateProfile = () => {
        setCanDismiss(true);
        setTimeout(() => clearData(), 600);
    };

    /**
     * 
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidFirstName &&
            isValidLastName &&
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
            setIsTouchedForEmail(!isValidEmail);
            return false;
        }
        return true;
    };

    /**
     * 
     * @returns 
     */
    const updateProfile = () => {

        if(!validateData()) {
            // showToast(`${t('Veuillez remplir tous les champs')} !`);
            return;
        }
        const token = localStorage.getItem('token');
        const data = {
            "first_name": ufirstName,
            "last_name": ulastName,
            "phone_number": phoneNumber,
            "email": uemail,
            "avatar": uavatar,
            "avatar_input_action": avatarInputAction
        };
        api.post('/update-profile-details', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message));

                api.get('/customer', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(response => {

                    setId(response.data.id);
                    setUserId(response.data.user.id);
                    setFirstName(response.data.user.first_name);
                    setLastName(response.data.user.last_name);
                    setPhoneNumber(response.data.user.phone_number);
                    setEmail(response.data.user.email);
                    setRole(response.data.user.role);
                    setAvatar(response.data.user.avatar);
                    setLogged(true);
                    setSessionCount(response.data.user.session_count);

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
                        logged: true,
                        session_count: response.data.user.session_count,
                        created_at: response.data.user.created_at
                    });
                    localStorage.setItem(token as string, user_infos);
                    setCanDismiss(true);
                    setTimeout(() => clearData(), 600);

                }).catch((error) => {
                    showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                });
            }
            else if(res.status === 204){
                showToast(`${t('Aucune modification apportée')} !`);
                setCanDismiss(true);
                setTimeout(() => clearData(), 600);
            }
            else{
                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
            }
        }).catch((error) => {
            showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
        });
    };

    return (
        <form
            id='userProfileDetailsEditForm'
            className="form w-100"
        >
            <div className='d-flex flex-column mt-0'>
                {/* <div className='d-flex flex-column mb-10'>
                    <IonTitle className='title-color font-md'>{t('Détails du profil')}</IonTitle>
                    <IonTitle className='title-color font-md'>{t('Image de profil')}</IonTitle>
                </div> */}
                <IonGrid className='m-0 px-0 pb-0'>
                    <IonRow>
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="position-relative input-group mb-6">
                                <div className='mb-3'>
                                    <IonLabel>{t('Image de profil')}</IonLabel>
                                </div>
                                {/*  begin::Avatar */}
                                <div className='avatar-wrapper d-flex flex-column flex-center'>
                                    <IonAvatar className="avatar">
                                        {/* begin::Preview avatar */}
                                        <img
                                            src={preview ? preview : toAbsolutePublicUrl(`/media/images/icons/avatar-${themeMode === 'dark' ? 'dark' : 'light'}.svg`)}
                                            className='avatar-image'
                                            alt='Avatar'
                                        />
                                        {/* end::Preview avatar */}
                                        {/* begin::Label */}
                                        <IonLabel
                                            data-image-input-action="change"
                                            title={t("Changer d'avatar")}
                                        >
                                            <IonButton
                                                type='button'
                                                buttonType='button'
                                                fill='clear'
                                                size='small'
                                                color='dark'
                                                id='btnChangeAvatar'
                                                onClick={() => {
                                                    const inputAvatar = document.getElementById('iptAvatar');

                                                    if (inputAvatar !== null) {
                                                        inputAvatar.click();
                                                    }
                                                }}
                                            >
                                                <IonIcon icon={PencilIconString} />
                                            </IonButton>
                                            {/* begin::Inputs */}
                                            <input
                                                type="file"
                                                name="avatar"
                                                id="iptAvatar"
                                                accept=".png,.jpg,.jpeg,.webp"
                                                // value={selectedFile}
                                                onChange={(e) => handleFileSelect(e)}
                                            />
                                            <input
                                                type="hidden"
                                                name="avatar_input_action"
                                                id="iptAvatarInputAction"
                                            />
                                            {/* end::Inputs */}
                                        </IonLabel>
                                        {/* end::Label */}
                                        {/* begin::Cancel or Remove */}
                                        <IonLabel
                                            className={preview ? 'd-flex' : 'd-none'}
                                            data-image-input-action={selectedFile ? 'cancel' : 'remove'}
                                            title={t(selectedFile ? "Annuler l'avatar" : "Supprimer l'avatar")}
                                        >
                                            <IonButton
                                                type='button'
                                                buttonType='button'
                                                fill='clear'
                                                size='small'
                                                color='dark'
                                                id='btnCancelOrRemoveAvatar'
                                                onClick={() => {
                                                    setUAvatar(undefined);
                                                    setPreview(selectedFile ? avatar : undefined);
                                                    handleAvatarInputAction(selectedFile ? 'none' : 'remove');
                                                    setselectedFile(false);
                                                }}
                                            >
                                                <IonIcon icon={close} />
                                            </IonButton>
                                        </IonLabel>
                                        {/* end::Cancel or Remove */}
                                    </IonAvatar>
                                    {/* begin::Hint */}
                                    <IonNote className="allowed-file-types-text d-flex flex-row flex-center mt-3">{t('Types de fichiers autorisés')}: png, jpg, jpeg.</IonNote>
                                    {/* end::Hint */}
                                </div>
                                {/* end::Avatar */}
                            </div>
                        </IonCol>
                        {/*  */}
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="position-relative input-group mb-2">
                                <IonInput
                                    type='text'
                                    label={t("Prénom")}
                                    labelPlacement="floating"
                                    aria-label={t("Prénom")}
                                    fill="solid"
                                    // helperText={t('Veuillez renseigner ce champ')}
                                    errorText={t('Veuillez renseigner le prénom')}
                                    className={`form-element content-color ${isValidFirstName && 'ion-valid'} ${!isValidFirstName && 'ion-invalid'} ${isTouchedForFirstName && 'ion-touched'}`}
                                    value={ufirstName}
                                    onIonBlur={() => setIsTouchedForFirstName(true)}
                                    onIonInput={(event) => changeFirstName(event.target.value as string)}
                                />
                            </div>
                        </IonCol>
                        {/*  */}
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="position-relative input-group mb-2">
                                <IonInput
                                    type='text'
                                    label={t("Nom")}
                                    labelPlacement="floating"
                                    aria-label={t("Nom")}
                                    fill="solid"
                                    // helperText={t('Veuillez renseigner ce champ')}
                                    errorText={t('Veuillez renseigner le nom')}
                                    className={`form-element content-color ${isValidLastName && 'ion-valid'} ${!isValidLastName && 'ion-invalid'} ${isTouchedForLastName && 'ion-touched'}`}
                                    value={ulastName}
                                    onIonBlur={() => setIsTouchedForLastName(true)}
                                    onIonInput={(event) => changeLastName(event.target.value as string)}
                                />
                            </div>
                        </IonCol>
                        {/*  */}
                        {/*  */}
                        <IonCol
                            size='12'
                            className='px-0'
                        >
                            <div className="position-relative input-group mb-0">
                                <IonInput
                                    type='email'
                                    label={t("Adresse e-mail (optionnel)")}
                                    labelPlacement="floating"
                                    aria-label={t("Adresse e-mail (optionnel)")}
                                    fill="solid"
                                    // helperText={t('Veuillez renseigner ce champ')}
                                    errorText={t('Adresse e-mail invalide')}
                                    className={`form-element content-color ${isValidEmail && 'ion-valid'} ${!isValidLastName && 'ion-invalid'} ${isTouchedForEmail && 'ion-touched'}`}
                                    value={uemail}
                                    onIonBlur={() => setIsTouchedForEmail(true)}
                                    onIonInput={(event) => changeEmail(event.target.value as string)}
                                />
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
                                    onClick={updateProfile}
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
                                    onClick={cancelUpdateProfile}
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

export default UserProfileDetailsEditForm;
