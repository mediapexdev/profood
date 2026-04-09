import React from 'react';

import Layout from '../layout/Layout';
import SignUpForm from './SignUpForm';

import './SignUpPage.css';

/**
 * 
 * @returns 
 */
const SignUpPage: React.FC = () => {

    return (
        <Layout
            showRecaptchaContainer={true}
            recaptchaContainerId='signUpRecaptchaContainer'
        >
            <SignUpForm />
        </Layout>
    );
};

export default SignUpPage;
