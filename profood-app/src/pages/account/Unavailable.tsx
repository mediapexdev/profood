import React from "react";

import LoginPrompt from "../../components/auth/LoginPrompt";

/**
 * Unavailable component for Account page
 * Displays login prompt when user is not authenticated
 */
const Unavailable: React.FC = () => {
    return (
        <LoginPrompt
            icon="👤"
            title="Mon compte"
            description="Connectez-vous pour accéder à votre profil et gérer vos informations."
        />
    );
};

export default Unavailable;
