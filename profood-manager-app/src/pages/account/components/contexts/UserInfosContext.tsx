import { createContext } from 'react';

import { UserRoleProps } from '../../../../types';

/**
 * Define the type for the context
 */
export type UserInfosContextType = {
    userId: number;
    userFirstName: string;
    userLastName: string;
    userPhoneNumber: string;
    userEmail: string;
    userRole?: UserRoleProps;
    userAvatar?: string;
    userActive: boolean;
    userLogged: boolean;
    userSessionCount: number;
    userCreatedAt: string;
    fetchData: () => void;
    setUserId: (id: number) => void;
    setUserFirstName: (lastName: string) => void;
    setUserLastName: (firstName: string) => void;
    setUserPhoneNumber: (phoneNumber: string) => void;
    setUserEmail: (email: string) => void;
    setUserRole: (role?: UserRoleProps) => void;
    setUserAvatar: (avatar?: string) => void;
    setUserActive: (active: boolean) => void;
    setUserLogged: (logged: boolean) => void;
    setUserSessionCount: (count: number) => void;
    setUserCreatedAt: (date: string) => void;
};

/**
 * Create the context
*/
const UserInfosContext = createContext<UserInfosContextType>({
    userId: 0,
    userFirstName: '',
    userLastName: '',
    userPhoneNumber: '',
    userEmail: '',
    userRole: undefined ,
    userAvatar: undefined,
    userActive: false,
    userLogged: false,
    userSessionCount: 0,
    userCreatedAt: '',
    fetchData: () => {/* */},
    setUserId: () => {/* */},
    setUserFirstName: () => {/* */},
    setUserLastName: () => {/* */},
    setUserPhoneNumber: () => {/* */},
    setUserEmail: () => {/* */},
    setUserRole: () => {/* */},
    setUserAvatar: () => {/* */},
    setUserActive: () => {/* */},
    setUserLogged: () => {/* */},
    setUserSessionCount: () => {/* */},
    setUserCreatedAt: () => {/* */}
});

export default UserInfosContext;
