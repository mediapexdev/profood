import React from 'react';

import {
    IonAvatar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonLabel,
    IonNote
} from '@ionic/react';

import { call, lockClosed, mail, person } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import { useUserInfosContext } from '../../contexts/UserInfosProvider';
import { formatPhoneNumber, toAbsolutePublicUrl } from '../../helpers/AssetHelpers';
import { useThemeModeContext } from '../../contexts/ThemeModeProvider';

import './UserInfos.css';

/**
 * 
 * @returns 
 */
const UserInfos: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        firstName,
        lastName,
        phoneNumber,
        email,
        avatar
    } = useUserInfosContext();

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    return (
        <div className='user-infos-widget d-flex flex-column align-items-stretch justify-content-center'>
            {/* begin::User profile infos */}
            <IonCard className='user-profile-widget card translucent-style'>
                <IonCardHeader className='user-profile-widget-header card-header'>
                    {/*  begin::Avatar */}
                    <div className='d-flex flex-row flex-nowrap align-items-center justify-content-center'>
                        <IonAvatar className="avatar-wrapper">
                            <img
                                className='avatar'
                                src={avatar ? avatar : toAbsolutePublicUrl(`/media/images/icons/avatar-${themeMode === 'dark' ? 'dark' : 'light'}.svg`)}
                                alt="Avatar"
                            />
                        </IonAvatar>
                    </div>
                    {/* end::Avatar */}
                </IonCardHeader>
                {/* begin::User infos content */}
                <IonCardContent className='user-info-widget-content card-body pb-7'>
                    {/* begin::User profile info */}
                    <div className='d-flex flex-column flex-nowrap align-items-stretch justify-content-center'>
                        <div className='d-flex flex-stack flex-row flex-nowrap py-2 mb-5'>
                            <div className='card-title-wrapper'>
                                <IonCardTitle className='card-title title-color font-md fw-semibold'>{t('Détails du profil')}</IonCardTitle>
                            </div>
                            <IonButton
                                buttonType='button'
                                fill='solid'
                                size='small'
                                color='dark'
                                id='btnEditProfileDetails'
                                className='text-transform-none'
                            >
                                <span>{t('Editer')}</span>
                            </IonButton>
                        </div>
                        <div className='user-infos-element-wrapper user-profile-element-wrapper d-flex align-items-center mb-8'>
                            <div className='icon-wrapper d-flex flex-center'>
                                <IonIcon
                                    icon={person}
                                    size='large'
                                    aria-hidden="true"
                                />
                            </div>
                            <div className='d-flex flex-column ms-3'>
                                <IonNote className='fs-8'>{t('Prénom et nom')}</IonNote>
                                <IonLabel>{`${firstName} ${lastName}`}</IonLabel>
                            </div>
                        </div>
                        <div className='user-infos-element-wrapper user-profile-element-wrapper d-flex align-items-center mb-8'>
                            <div className='icon-wrapper d-flex flex-center'>
                                <IonIcon
                                    icon={call}
                                    size='large'
                                    aria-hidden="true"
                                />
                            </div>
                            <div className='d-flex flex-column ms-3'>
                                <IonNote className='fs-8'>{t('Téléphone')}</IonNote>
                                <IonLabel>{formatPhoneNumber(phoneNumber)}</IonLabel>
                            </div>
                        </div>
                        <div className='user-infos-element-wrapper user-profile-element-wrapper d-flex align-items-center mb-0'>
                            <div className='icon-wrapper d-flex flex-center'>
                                <IonIcon
                                    icon={mail}
                                    size='large'
                                    aria-hidden="true"
                                />
                            </div>
                            <div className='d-flex flex-column ms-3'>
                                <IonNote className='fs-8'>{t('Adresse e-mail')}</IonNote>
                                <IonLabel>{email || t('Non renseigné')}</IonLabel>
                            </div>
                        </div>
                    </div>
                    {/* end::User profile info */}

                    {/* begin::Sign in method & Security */}
                    {/* <div className='d-flex flex-column flex-nowrap align-items-stretch justify-content-center mt-8'>
                        <div className='title-wrapper d-flex flex-stack flex-row flex-nowrap py-2 mb-5'>
                            <IonTitle className='title-color font-md fw-semibold'>Méthode de connexion et sécurité</IonTitle>
                        </div>
                        <div className='user-profile-element-wrapper d-flex flex-stack mb-8'>
                            <div className='d-flex flex-center'>
                                <div className='icon-wrapper d-flex flex-center'>
                                    <IonIcon
                                        icon={lockClosed}
                                        size='large'
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className='d-flex flex-column ms-3'>
                                    <IonNote className='fs-8'>Mot de passe</IonNote>
                                    <IonLabel>{`********`}</IonLabel>
                                </div>
                            </div>
                            <IonButton
                                buttonType='button'
                                fill='solid'
                                size='small'
                                color='dark'
                                id='btnEditProfile'
                                className='text-transform-none'
                            >
                                <span>Editer</span>
                            </IonButton>
                        </div>
                    </div> */}
                    {/* end::Sign in method & Security */}
                </IonCardContent>
                {/* end::User infos content */}
            </IonCard>
            {/* end::User profile infos */}

            {/* begin::Sign in method & Security */}
            <IonCard className='sign-in-method-and-security-widget card translucent-style'>
                <IonCardHeader className='sign-in-method-and-security-header card-header mb-2'>
                    <div className='d-flex flex-row flex-nowrap align-items-center justify-content-between py-2'>
                        <div className='card-title-wrapper'>
                            <IonCardTitle className='card-title title-color font-md fw-semibold'>{t('Méthode de connexion et sécurité')}</IonCardTitle>
                        </div>
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='clear'
                            size='small'
                            color='dark'
                            id='btnChangePassword'
                        >
                            {/* <IonIcon icon={PencilIconString}></IonIcon> */}
                        </IonButton>
                    </div>
                </IonCardHeader>
                <IonCardContent className='sign-in-method-and-security-widget-content card-body pb-7'>
                    <div className='user-infos-element-wrapper sign-in-method-and-security-element-wrapper d-flex flex-stack mb-8'>
                        <div className='d-flex flex-center'>
                            <div className='icon-wrapper d-flex flex-center'>
                                <IonIcon
                                    icon={lockClosed}
                                    size='large'
                                    aria-hidden="true"
                                />
                            </div>
                            <div className='d-flex flex-column ms-3'>
                                <IonNote className='fs-8'>{t('Mot de passe')}</IonNote>
                                <IonLabel>{`********`}</IonLabel>
                            </div>
                        </div>
                        <IonButton
                            type='button'
                            buttonType='button'
                            fill='solid'
                            size='small'
                            color='dark'
                            id='btnEditPassword'
                            className='text-transform-none'
                        >
                            <span>{t('Changer')}</span>
                        </IonButton>
                    </div>
                </IonCardContent>
            </IonCard>
            {/* end::Sign in method & Security */}
        </div>
    );
};

export default UserInfos;
