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

import { useUserPasswordEditModalContext } from '../../contexts/UserPasswordEditModalProvider';
import UserPasswordEditForm from '../forms/UserPasswordEditForm';

import './UserPasswordEditModal.css';

/**
 * 
 * @returns 
 */
const UserPasswordEditModal: React.FC = () => {
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
    const { canDismiss, setCanDismiss } = useUserPasswordEditModalContext();

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
            trigger="btnEditPassword"
            id='userPasswordEditModal'
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
                    <IonTitle className='title-color font-lg'>{t('Edition du mot de passe')}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <UserPasswordEditForm />
            </IonContent>
        </IonModal>
    );
};

export default UserPasswordEditModal;
