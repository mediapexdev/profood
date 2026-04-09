import React, { useContext, useState } from 'react';

import UserPasswordEditModalContext, { UserPasswordEditModalContextType } from './UserPasswordEditModalContext';

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
export const useUserPasswordEditModalContext = () => useContext(UserPasswordEditModalContext);

/**
 * Create the provider component
 * 
 * @param param0 
 * @returns 
 */
const UserPasswordEditModalProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [canDismiss, setCanDismiss] = useState<boolean>(false);

    /**
     * Define the context value
     */
    const contextValue: UserPasswordEditModalContextType = {
        canDismiss,
        setCanDismiss
    };
    return <UserPasswordEditModalContext.Provider value={contextValue}>{children}</UserPasswordEditModalContext.Provider>;
};

export default UserPasswordEditModalProvider;
