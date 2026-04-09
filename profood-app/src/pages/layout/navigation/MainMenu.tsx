import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import {
    IonAvatar,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonNote
} from '@ionic/react';

import {
    languageOutline,
    languageSharp,
    documentTextOutline,
    documentTextSharp,
    shieldCheckmarkOutline,
    shieldCheckmarkSharp,
    helpCircleOutline,
    helpCircleSharp, 
    homeOutline,
    homeSharp,
    moonSharp,
    moonOutline,
    logInSharp,
    logInOutline,
    logOutSharp,
    logOutOutline
} from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import ThemeController from '../theme-mode/ThemeController';
import AUTH from '../../auth/services/authentication';
import useToast from '../../../components/hooks/useToast';
import { AppPage } from './types';
import { useUserInfosContext } from '../../../contexts/UserInfosProvider';
import { formatPhoneNumber, toAbsolutePublicUrl } from '../../../helpers/AssetHelpers';
import { useThemeModeContext } from '../../../contexts/ThemeModeProvider';

import './MainMenu.css';

/**
 * 
 * @returns 
 */
const MainMenu: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const location = useLocation();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const appPages: AppPage[] = [
        {
            id: 'home',
            title: t('Accueil'),
            url: '/views/home',
            iosIcon: homeOutline,
            mdIcon: homeSharp,
            iconClassName: ''
        },
        {
            id: 'languages',
            title: t('Langues'),
            url: '/languages',
            iosIcon: languageOutline,
            mdIcon: languageSharp,
            iconClassName: ''
        },
        // {
        //     id: 'notifications',
        //     title: 'Notifications',
        //     url: '/page/Inbox',
        //     iosIcon: notificationsOutline,
        //     mdIcon: notificationsSharp
        // },
        {
            id: 'faq',
            title: t('FAQ'),
            url: '/faqs',
            iosIcon: helpCircleOutline,
            mdIcon: helpCircleSharp,
            iconClassName: ''
        },
        {
            id: 'termsAndCOnditions',
            title: t("Conditions d'utilisation"),
            url: '/terms-and-conditions',
            iosIcon: documentTextOutline,
            mdIcon: documentTextSharp,
            iconClassName: ''
        },
        {
            id: 'privacyPolicy',
            title: t('Politique de confidentialité'),
            url: '/privacy-policy',
            iosIcon: shieldCheckmarkOutline,
            mdIcon: shieldCheckmarkSharp,
            iconClassName: ''
        }
    ];
    /**
     * 
     */
    const {
        firstName,
        lastName,
        phoneNumber,
        avatar,
        logged,
        setId,
        setUserId,
        setFirstName,
        setLastName,
        setPhoneNumber,
        setRole,
        setAvatar,
        setLogged
    } = useUserInfosContext();
    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    const logout = useCallback(() => {

        const token = localStorage.getItem('token');

        if(token !== null && logged){

            AUTH.logout(token).then((res) => {
                setId(0);
                setUserId(0);
                setFirstName('');
                setLastName('');
                setPhoneNumber('');
                setRole(undefined);
                setAvatar(undefined);
                setLogged(false);
                localStorage.removeItem(localStorage.getItem('token') as string);
                localStorage.removeItem('token');
                showToast(`${t('Vous êtes maintenant déconnecté')} !`);
            })
            .catch((error) => {
                showToast(error.message);
                console.log(error);
            });
        }
    }, [logged, setAvatar, setFirstName, setId, setLastName, setLogged, setPhoneNumber, setRole, setUserId, showToast]);
    return (
        <IonMenu
            contentId="main"
            type="overlay"
            id='mainMenu'
            className={['/signin', '/signup', '/password-reset'].includes(location.pathname) ? 'd-none' : ''}
        >
            <IonContent>
                {/* begin::User infos */}
                <div className="menu-user-infos d-flex flex-column flex-center pb-4">
                    {/*  begin::Avatar */}
                    <IonAvatar className="avatar-wrapper mb-3">
                        <img
                            className='avatar'
                            src={avatar ? avatar : toAbsolutePublicUrl(`/media/images/icons/avatar-${themeMode === 'dark' ? 'dark' : 'light'}.svg`)}
                            alt="Avatar"
                        />
                    </IonAvatar>
                    {/* end::Avatar */}
                    {/* begin::User infos content */}
                    <div className="menu-user-infos-content d-flex flex-row flex-center">
                    {
                        (logged)
                        ?
                        <div className='d-flex flex-column flex-center'>
                            <IonLabel className='full-name-label fw-medium fs-6'>{`${firstName} ${lastName}`}</IonLabel>
                            <IonNote className='phone-number-label fw-medium'>{formatPhoneNumber(phoneNumber)}</IonNote>
                        </div>
                        :
                        <IonLabel>{t('Non connecté')}</IonLabel>
                    }
                    </div>
                    {/* end::User infos content */}
                </div>
                {/* end::User infos */}
                {/* begin::Menu list */}
                <IonList>
                {
                    appPages.map((appPage, index) => {
                        return (
                            <IonMenuToggle
                                key={index}
                                autoHide={false}
                            >
                                <IonItem
                                    routerLink={appPage.url}
                                    routerDirection='forward'
                                    detail={false}
                                    lines='none'
                                    className={location.pathname === appPage.url ? 'selected' : ''}
                                >
                                    <IonIcon
                                        slot='start'
                                        aria-hidden={true}
                                        ios={appPage.iosIcon}
                                        md={appPage.mdIcon}
                                    />
                                    <IonLabel>{appPage.title}</IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                        );
                    })
                }
                    <IonItem
                        button={true}
                        detail={false}
                        lines="none"
                    >
                        <IonIcon
                            slot="start"
                            aria-hidden="true"
                            ios={moonOutline}
                            md={moonSharp}
                        />
                        <ThemeController />
                    </IonItem>
                    <IonMenuToggle autoHide={false}>
                    {
                        logged
                        ?
                        <IonItem
                            button={true}
                            detail={false}
                            lines='none'
                            onClick={logout}
                        >
                            <IonIcon
                                slot='start'
                                aria-hidden={true}
                                ios={logOutOutline}
                                md={logOutSharp}
                            />
                            <IonLabel>{t('Se déconnecter')}</IonLabel>
                        </IonItem>
                        :
                        <IonItem
                            button={true}
                            detail={false}
                            lines="none"
                            routerLink='/signin'
                            routerDirection='root'
                        >
                            <IonIcon
                                slot='start'
                                aria-hidden="true"
                                ios={logInOutline}
                                md={logInSharp}
                            />
                            <IonLabel>{t('Se connecter')}</IonLabel>
                        </IonItem>
                    }
                    </IonMenuToggle>
                </IonList>
                {/* end::Menu list */}
            </IonContent>
        </IonMenu>
    );
};

export default MainMenu;
