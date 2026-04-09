import React from 'react';

import Layout from '../layout/Layout';
import SignInForm from './SignInForm';

import './SignInPage.css';

/**
 * 
 * @returns 
 */
const SignInPage: React.FC = () => {

    return (
        <Layout>
            <SignInForm />
        </Layout>
    );
};

export default SignInPage;
