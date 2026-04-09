import React, { useContext, useEffect, useMemo, useState } from 'react';

import UserInfosContext, { UserInfosContextType, UserRoleProps } from './UserInfosContext';

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
    const [id, setId] = useState<number>(0);
    const [userId, setUserId] = useState<number>(0);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<UserRoleProps | undefined>(undefined);
    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    const [active, setActive] = useState<boolean>(false);
    const [logged, setLogged] = useState<boolean>(false);
    const [sessionCount, setSessionCount] = useState<number>(0);
    const [createdAt, setCreatedAt] = useState<string>('');

    /**
     * 
     */
    useEffect(() => {

        const token: string = localStorage.getItem('token') as string;
        const userInfos = (token) ? JSON.parse(localStorage.getItem(token) as string) : undefined;

        if(userInfos){
            setLogged(userInfos.logged);
            setId(userInfos.id);
            setUserId(userInfos.user_id);
            setFirstName(userInfos.first_name);
            setLastName(userInfos.last_name);
            setPhoneNumber(userInfos.phone_number);
            setEmail(userInfos.email);
            setRole(userInfos.role);
            setAvatar(userInfos.avatar);
            setActive(userInfos.active);
            setSessionCount(userInfos.session_count);
            setCreatedAt(userInfos.created_at);
        }
    }, []);

    /**
     * Define the context value
     * Memoize to prevent unnecessary re-renders when parent components re-render
     */
    const contextValue: UserInfosContextType = useMemo(() => ({
        id,
        userId,
        firstName,
        lastName,
        phoneNumber,
        email,
        role,
        avatar,
        active,
        logged,
        sessionCount,
        createdAt,
        setId,
        setUserId,
        setFirstName,
        setLastName,
        setPhoneNumber,
        setEmail,
        setRole,
        setAvatar,
        setActive,
        setLogged,
        setSessionCount,
        setCreatedAt
    }), [
        id,
        userId,
        firstName,
        lastName,
        phoneNumber,
        email,
        role,
        avatar,
        active,
        logged,
        sessionCount,
        createdAt,
        setId,
        setUserId,
        setFirstName,
        setLastName,
        setPhoneNumber,
        setEmail,
        setRole,
        setAvatar,
        setActive,
        setLogged,
        setSessionCount,
        setCreatedAt
    ]);
    return <UserInfosContext.Provider value={contextValue}>{children}</UserInfosContext.Provider>;
};

export default UserInfosProvider;
