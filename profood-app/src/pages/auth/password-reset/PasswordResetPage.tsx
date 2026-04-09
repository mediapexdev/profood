import React from 'react';

import Layout from '../layout/Layout';
import PasswordResetForm from './PasswordResetForm';

/**
 * 
 * @returns 
 */
const PasswordResetPage: React.FC = () => {

    return (
        <Layout
            showRecaptchaContainer={true}
            recaptchaContainerId='passwordResetRecaptchaContainer'
        >
            <PasswordResetForm />
        </Layout>
    );
};

export default PasswordResetPage;
