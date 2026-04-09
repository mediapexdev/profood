import React from 'react';

import Layout from '../layout/Layout';
import SignInForm from './components/SignInForm';
import AlertProvider from '../components/contexts/AlertProvider';

import './SignInPage.css';

/**
 * 
 * @returns 
 */
const SignInPage : React.FC = () => {
    /**
     * 
     */
    return (
        <AlertProvider>
            <Layout>
                <SignInForm />
            </Layout>
        </AlertProvider>
    );
};

export default SignInPage;
