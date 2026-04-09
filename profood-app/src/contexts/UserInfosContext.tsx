import { createContext } from 'react';

/**
 * 
 */
export interface UserRoleProps {
    id: number;
    wording: string;
    code: number;
}

/**
 * Define the type for the context
 */
export type UserInfosContextType = {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: UserRoleProps|undefined;
    avatar: string|undefined;
    active: boolean;
    logged: boolean;
    sessionCount: number;
    createdAt: string;
    setId: (id: number) => void;
    setUserId: (id: number) => void;
    setFirstName: (first_name: string) => void;
    setLastName: (last_name: string) => void;
    setPhoneNumber: (phone_number: string) => void;
    setEmail: (email: string) => void;
    setRole: (role: UserRoleProps | undefined) => void;
    setAvatar: (avatar: string | undefined) => void;
    setActive: (active: boolean) => void;
    setLogged: (logged: boolean) => void;
    setSessionCount: (count: number) => void;
    setCreatedAt: (date: string) => void;
};

/**
 * Create the context
 */
const UserInfosContext = createContext<UserInfosContextType>({
    id: 0,
    userId: 0,
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    role: undefined ,
    avatar: undefined,
    active: false,
    logged: false,
    sessionCount: 0,
    createdAt: '',
    setId: () => {/* */},
    setUserId: () => {/* */},
    setFirstName: () => {/* */},
    setLastName: () => {/* */},
    setPhoneNumber: () => {/* */},
    setEmail: () => {/* */},
    setRole: () => {/* */},
    setAvatar: () => {/* */},
    setActive: () => {/* */},
    setLogged: () => {/* */},
    setSessionCount: () => {/* */},
    setCreatedAt: () => {/* */}
});

export default UserInfosContext;
