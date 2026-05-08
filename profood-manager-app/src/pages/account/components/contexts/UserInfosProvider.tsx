import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import api from '../../../../api/api';
import { UserRoleProps } from '../../../../types';
import UserInfosContext, { UserInfosContextType } from './UserInfosContext';
import { useLoadingSpinnerContext } from '../../../../components/contexts/LoadingSpinnerProvider';
import useToast from '../../../../components/hooks/useToast';

/**
 * 
 */
interface Props {
    children: React.ReactNode;
}

/**
 * 
 * @returns 
 */
export const useUserInfosContext = () => useContext(UserInfosContext);

/**
 * Create the provider component
 * 
 * @param param0 
 * @returns 
 */
const UserInfosProvider = ({ children }: Props) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [userId, setUserId] = useState<number>(0);
    const [userFirstName, setUserFirstName] = useState<string>('');
    const [userLastName, setUserLastName] = useState<string>('');
    const [userPhoneNumber, setUserPhoneNumber] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [userRole, setUserRole] = useState<UserRoleProps | undefined>(undefined);
    const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
    const [userActive, setUserActive] = useState<boolean>(false);
    const [userLogged, setUserLogged] = useState<boolean>(false);
    const [userSessionCount, setUserSessionCount] = useState<number>(0);
    const [userCreatedAt, setUserCreatedAt] = useState<string>('');

    /**
     * 
     */
    useEffect(() => {
        
        const token = localStorage.getItem('token') as string;
        const userInfos = (token) ? JSON.parse(localStorage.getItem(token) as string) : undefined;

        if(userInfos){
            setUserLogged(userInfos.logged);
            setUserId(userInfos.user_id);
            setUserFirstName(userInfos.first_name);
            setUserLastName(userInfos.last_name);
            setUserPhoneNumber(userInfos.phone_number);
            setUserEmail(userInfos.email);
            setUserRole(userInfos.role);
            setUserAvatar(userInfos.avatar);
            setUserActive(userInfos.active);
            setUserSessionCount(userInfos.session_count);
            setUserCreatedAt(userInfos.created_at);
        }
    }, []);

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
    const fetchData = useCallback(() => {

        setShowSpinner(true);
        const token = localStorage.getItem('token');
        api.get('/app-manager', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }).then(response => {
            setUserId(response.data.user.id);
            setUserFirstName(response.data.user.first_name);
            setUserLastName(response.data.user.last_name);
            setUserPhoneNumber(response.data.user.phone_number);
            setUserEmail(response.data.user.email);
            setUserRole(response.data.user.role);
            setUserAvatar(response.data.user.avatar);
            setUserActive(response.data.active);
            setUserSessionCount(response.data.user.session_count);
            setUserCreatedAt(response.data.user.avatar);
            setUserLogged(true);
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
        })
        .catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            console.dir(error);
        });
    }, [setShowSpinner, showToast, t]);

    /**
     * Define the context value
     */
    const contextValue: UserInfosContextType = {
        userId,
        userFirstName,
        userLastName,
        userPhoneNumber,
        userEmail,
        userRole,
        userAvatar,
        userActive,
        userLogged,
        userSessionCount,
        userCreatedAt,
        fetchData,
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
    };
    return <UserInfosContext.Provider value={contextValue}>{children}</UserInfosContext.Provider>;
};

export default UserInfosProvider;
