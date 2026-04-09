import React, { useCallback } from 'react';

import {
    IonButton,
    IonButtons,
    IonIcon
} from '@ionic/react';
import { reload } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { useCategoryContext } from '../../../../contexts/CategoryProvider';
import { useCartContext } from '../../../cart/components/contexts/CartProvider';
import { useUserInfosContext } from '../../../../contexts/UserInfosProvider';

import './Menu.css';

/**
 * 
 * @returns 
 */
const Menu: React.FC = () => {
    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const {slices, totalNumber, clear} = useCategoryContext();

    /**
     * 
     */
    const { updateSlices } = useCartContext();

    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const resetSelection = useCallback(() => {
        clear();
        showToast(`${t('Sélection réinitialisée')} !`);
    }, [clear]);

    /**
     * 
     */
    const { logged, userId } = useUserInfosContext();

    /**
     * 
     */
    const addTocart = useCallback(() => {

        if(totalNumber < 1){
            showToast(`${t("Vous n'avez encore rien choisi")} !`);
        }
        else{
            const data = {
                customer_id: userId,
                slices: slices
            };
            const token = localStorage.getItem('token');

            if(token !== null && logged){

                const myHeaders = { Authorization: `Bearer ${token}` };

                api.post('/add-slices-to-cart', data, { headers: myHeaders })
                .then((res) => {
                    if(res.status === 200){
                        showToast(t(res.data.message));
                        clear();

                        api.get('/get-cart-slices', { headers : myHeaders })
                        .then((res) => {
                            if(res.status === 200){
                                updateSlices(res.data);
                            }
                            else{
                                showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                            }
                        })
                        .catch((error) => {
                            showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                            console.log(error);
                        });
                    }
                    else{
                        showToast(res.data.message ? t(res.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                    }
                })
                .catch((error) => {
                    showToast(error.response.data.message ? t(error.response.data.message) : `${t('Une erreur est survenue ! Veuillez réessayer ou contacter Profood')}.`);
                    console.log(error);
                });
            }
            else{
                showToast(`${t('Veuillez vous connecter pour ajouter au panier')}.`);
                // router.push("/signin", "forward", "push");
            }
        }
    }, [clear, logged, slices, totalNumber, updateSlices, userId]);

    return (
        // {/* begin::Buttons */}
        <IonButtons slot="end">
            <div>
                <IonButton
                    type='button'
                    buttonType='button'
                    fill='solid'
                    size='small'
                    color='dark'
                    className='btn-add-to-cart text-transform-none'
                    onClick={addTocart}
                >
                    <span>{t('Ajouter au panier')}</span>
                </IonButton>
                <IonButton
                    type='button'
                    buttonType='button'
                    fill='solid'
                    size='small'
                    color='dark'
                    slot='icon-only'
                    className='btn-reset-cart'
                    onClick={resetSelection}
                >
                    <IonIcon icon={reload} />
                </IonButton>
            </div>
        </IonButtons>
        // {/* end::Buttons */}
    );
};

export default Menu;
