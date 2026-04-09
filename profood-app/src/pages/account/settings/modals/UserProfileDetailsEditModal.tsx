import React, { useCallback, useEffect, useRef } from 'react';

import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { close } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import { useUserProfileDetailsEditModalContext } from '../../contexts/UserProfileDetailsEditModalProvider';
import UserProfileDetailsEditForm from '../forms/UserProfileDetailsEditForm';

import './UserProfileDetailsEditModal.css';

/**
 * 
 * @returns 
 */
const UserProfileDetailsEditModal: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const modal = useRef<HTMLIonModalElement>(null);

    /**
     * 
     */
    const { canDismiss, setCanDismiss } = useUserProfileDetailsEditModalContext();

    /**
     * 
     */
    const dismiss = useCallback(() => {
        // setCanDismiss(true);
        modal.current?.dismiss();
    }, []);

    /**
     * 
     */
    useEffect(() => {
        if(canDismiss){
            dismiss();
            setCanDismiss(false);
        }
    }, [canDismiss]);

    return (
        <IonModal
            ref={modal}
            trigger="btnEditProfileDetails"
            id='userProfileDetailsEditModal'
            className='form-modal'
        >
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton
                            fill='clear'
                            size='default'
                            color='dark'
                            onClick={dismiss}
                        >
                            <IonIcon icon={close}></IonIcon>
                        </IonButton>
                    </IonButtons>
                    <IonTitle className='title-color font-lg'>{t("Edition du profil")}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <UserProfileDetailsEditForm />
            </IonContent>
        </IonModal>
    );
};

export default UserProfileDetailsEditModal;
