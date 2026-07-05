import React, { useState } from 'react';

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from 'react-i18next';

import { toAbsolutePublicUrl } from '../../../helpers/AssetHelpers';
import { useUserInfosContext } from './contexts/UserInfosProvider';
import AUTH from '../../auth/services/authentication';
import useToast from '../../../components/hooks/useToast';
import useGoTo from '../../../components/hooks/useGoTo';
import useGoToSignIn from '../../../components/hooks/useGoToSignIn';
import { useThemeModeContext } from '../../../components/contexts/ThemeModeProvider';
import { useLoadingSpinnerContext } from '../../../components/contexts/LoadingSpinnerProvider';

import './UserMenu.css';

/**
 * 
 * @returns 
 */
const UserMenu: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        userFirstName,
        userLastName,
        userRole,
        userAvatar,
        userSessionCount,
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
    const logout = () => {

        setShowSpinner(true);
        const token = localStorage.getItem('token');

        if(token !== null){
            AUTH.logout(token).then((res) => {
                setUserId(0);
                setUserFirstName('');
                setUserLastName('');
                setUserPhoneNumber('');
                setUserEmail('');
                setUserRole(undefined);
                setUserAvatar(undefined);
                setUserActive(false);
                setUserLogged(false);
                setUserSessionCount(userSessionCount - 1);
                setUserCreatedAt('');
                toggleDropdown();
                showToast(t('Vous êtes maintenant déconnecté'), 'success', { autoClose: 2000});
                setTimeout(() => {
                    goToSignIn();
                    localStorage.removeItem(localStorage.getItem('token') as string);
                    localStorage.removeItem('token');
                    setShowSpinner(false);
                }, 2400);
            })
            .catch((error) => {
                // Even if /signout fails (e.g. the token already expired), clear
                // the local session and leave — otherwise the user is stuck
                // "logged in" with no way to sign out.
                localStorage.removeItem(localStorage.getItem('token') as string);
                localStorage.removeItem('token');
                toggleDropdown();
                goToSignIn();
                setShowSpinner(false);
                console.log(error);
            });
        }
    };

    /**
     * 
     */
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    return (
        <Dropdown
            isOpen={dropdownOpen}
            toggle={toggleDropdown}
            className='user-menu-dropdown dropdown-center'
        >
            {/* begin::dropdown toggle */}
            <DropdownToggle
                id='mainHeaderUserMenuToggler'
                className='menu-toggler user-menu-toggler btn-sm d-flex flex-center rounded-circle p-1 p-00'
                color='light'
            >
                <div className="avatar-wrapper w-40px h-40px">
                    <img
                        className='avatar img-fluid rounded-circle'
                        src={userAvatar ? userAvatar : toAbsolutePublicUrl(`/assets/media/images/icons/svg/avatar-${themeMode === 'dark' ? 'dark' : 'light'}.svg`)}
                        alt="Avatar"
                    />
                </div>
            </DropdownToggle>
            {/* end::dropdown toggle */}
            {/* begin::dropdown menu */}
            <DropdownMenu className='user-dropdown-menu w-225px'>
                <DropdownItem header>
                    {/* begin::User info */}
                    <div className="admin-info d-flex flex-column flex-center mb-4">
                        {/*  begin::Avatar */}
                        <div className="avatar-wrapper w-64px h-64px mb-2">
                            <img
                                className='avatar img-fluid rounded-circle'
                                src={userAvatar ? userAvatar : toAbsolutePublicUrl(`/assets/media/images/icons/svg/avatar-${themeMode === 'dark' ? 'dark' : 'light'}.svg`)}
                                alt="Avatar"
                            />
                        </div>
                        {/* end::Avatar */}
                        {/* begin::User info content */}
                        <div className="admin-info-content d-flex flex-row flex-center">
                            <div className='d-flex flex-column flex-center'>
                                <span className='full-name-label title-color fw-medium fs-7 mb-1'>{`${userFirstName} ${userLastName}`}</span>
                                {/* <span className='phone-number-label fw-normal'>{formatPhoneNumber(userPhoneNumber)}</span> */}
                                <span className='user-role-label fw-normal'>{t(`${userRole?.wording}`)}</span>
                            </div>
                        </div>
                        {/* end::User info content */}
                    </div>
                    {/* end::User info */}
                </DropdownItem>
                <DropdownItem 
                    className='d-flex align-items-center'
                    onClick={() => goTo('/parametres/compte')}
                >
                    <span className='icon-wrapper text-gray-600'>
                        <FontAwesomeIcon icon={faUser}/>
                    </span>
                    <span className='ms-3'>{t('Profil')}</span>
                </DropdownItem>
                {/* <DropdownItem 
                    className='d-flex align-items-center'
                    // onClick={logout}
                >
                    <span className='icon-wrapper text-gray-600'>
                        <FontAwesomeIcon icon={faLock}/>
                    </span>
                    <span className='ms-3'>{t("Verrouiller l'écran")}</span>
                </DropdownItem> */}
                <DropdownItem divider />
                <DropdownItem 
                    className='d-flex align-items-center'
                    onClick={logout}
                >
                    <span className='icon-wrapper text-gray-600'>
                        <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                    </span>
                    <span className='ms-3'>{t('Se déconnecter')}</span>
                </DropdownItem>
            </DropdownMenu>
            {/* end::dropdown menu */}
        </Dropdown>
    );
};

export default UserMenu;
