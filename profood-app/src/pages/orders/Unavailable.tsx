import React from "react";

import LoginPrompt from "../../components/auth/LoginPrompt";

/**
 * Unavailable component for Orders page
 * Displays login prompt when user is not authenticated
 */
const Unavailable: React.FC = () => {
    return (
        <LoginPrompt
            icon="📦"
            title="Mes commandes"
            description="Connectez-vous pour voir et suivre vos commandes en temps réel."
        />
    );
};

export default Unavailable;
