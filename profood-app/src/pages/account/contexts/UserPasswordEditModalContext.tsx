import { createContext } from 'react';

/**
 * Define the type for the context
 */
export type UserPasswordEditModalContextType = {
    canDismiss: boolean;
    setCanDismiss: (can_dismiss : boolean) => void;
};

/**
 * Create the context
 */
const UserPasswordEditModalContext = createContext<UserPasswordEditModalContextType>({
    canDismiss: false,
    setCanDismiss: () => {}
});

export default UserPasswordEditModalContext;
