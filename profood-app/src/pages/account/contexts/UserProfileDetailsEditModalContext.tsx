import { createContext } from 'react';

/**
 * Define the type for the context
 */
export type UserProfileDetailsEditModalContextType = {
    canDismiss: boolean;
    setCanDismiss: (can_dismiss : boolean) => void;
};

/**
 * Create the context
 */
const UserProfileDetailsEditModalContext = createContext<UserProfileDetailsEditModalContextType>({
    canDismiss: false,
    setCanDismiss: () => {}
});

export default UserProfileDetailsEditModalContext;
