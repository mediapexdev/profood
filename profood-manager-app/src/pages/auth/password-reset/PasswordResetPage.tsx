import React from 'react';

import Layout from '../layout/Layout';

import PasswordResetForm from './PasswordResetForm';
import AlertProvider from '../components/contexts/AlertProvider';

import './PasswordResetPage.css';

/**
 * 
 * @returns 
 */
const PasswordResetPage : React.FC = () => {

    return (
        <AlertProvider>
            <Layout>
                <PasswordResetForm />
            </Layout>
        </AlertProvider>
    );
};

export default PasswordResetPage;
