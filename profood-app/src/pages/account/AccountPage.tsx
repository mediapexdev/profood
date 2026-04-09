import React from 'react';

import { IonContent, IonPage, useIonViewDidEnter } from '@ionic/react';

import Header from './layout/Header';
import UserInfos from './UserInfos';
import UserProfileDetailsEditModal from './settings/modals/UserProfileDetailsEditModal';
import UserPasswordEditModal from './settings/modals/UserPasswordEditModal';
import UserProfileDetailsEditModalProvider from './contexts/UserProfileDetailsEditModalProvider';
import UserPasswordEditModalProvider from './contexts/UserPasswordEditModalProvider';
import useToggleTabBar from '../../components/hooks/useToggleTabBar';
import { useUserInfosContext } from '../../contexts/UserInfosProvider';
import Unavailable from './Unavailable';

import './AccountPage.css';

/**
 * 
 * @returns 
 */
const AccountPage: React.FC = () => {
    /**
     * 
     */
    const toggleTabBar = useToggleTabBar();

    /**
     * 
     */
    useIonViewDidEnter(() => {
        toggleTabBar(true);
    });

    /**
     * 
     */
    const { logged } = useUserInfosContext();

    return (
        <UserProfileDetailsEditModalProvider>
            <UserPasswordEditModalProvider>
                <IonPage id='accountPage'>
                    <Header />
                    <IonContent className='ion-padding'>
                        <div className="wrapper">
                        {
                            logged
                            ?
                            <React.Fragment>
                                <UserInfos />
                                <UserProfileDetailsEditModal />
                                <UserPasswordEditModal />
                            </React.Fragment>
                            :
                            <Unavailable />
                        }
                        </div>
                    </IonContent>
                </IonPage>
            </UserPasswordEditModalProvider>
        </UserProfileDetailsEditModalProvider>
    );
};

export default AccountPage;
