import React, { useContext, useState } from 'react';

import UserProfileDetailsEditModalContext, { UserProfileDetailsEditModalContextType } from './UserProfileDetailsEditModalContext';

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
export const useUserProfileDetailsEditModalContext = () => useContext(UserProfileDetailsEditModalContext);

/**
 * Create the provider component
 * 
 * @param param0 
 * @returns 
 */
const UserProfileDetailsModalProvider = ({ children }: Props) => {
    /**
     * 
     */
    const [canDismiss, setCanDismiss] = useState<boolean>(false);

    /**
     * Define the context value
     */
    const contextValue: UserProfileDetailsEditModalContextType = {
        canDismiss,
        setCanDismiss
    };
    return <UserProfileDetailsEditModalContext.Provider value={contextValue}>{children}</UserProfileDetailsEditModalContext.Provider>;
};

export default UserProfileDetailsModalProvider;
