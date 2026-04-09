import React, { useCallback, useContext } from 'react';

import {
    IonButton,
    IonButtons,
    IonIcon,
    useIonViewDidLeave
} from '@ionic/react';
import { reload } from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import api from '../../../../api/api';
import { CurrentBoxTypeContext } from '../BoxTypeSlicesPage';
import { useBoxTypeContext } from '../../../../contexts/BoxTypeProvider';
import useToast from '../../../../components/hooks/useToast';
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
    const { t } = useTranslation();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const currentBoxType = useContext(CurrentBoxTypeContext);

    /**
     * 
     */
    const { maximumNumber, slices, totalNumber, clear } = useBoxTypeContext();

    /**
     * 
     */
    const { updateBoxes } = useCartContext();

    /**
     * 
     */
    useIonViewDidLeave(() => {
        clear();
    });

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

        if(totalNumber < maximumNumber){
            showToast(`${t('Sélection insuffisante')} !`);
        }
        else{
            const data = {
                customer_id: userId,
                // box_type_id : box_type_props.id,
                box_type_id: currentBoxType?.id,
                slices: slices
            };
            const token = localStorage.getItem('token');

            if(token !== null && logged){

                const myHeaders = { Authorization: `Bearer ${token}` };

                api.post('/add-box-to-cart', data, {headers: myHeaders })
                .then((res) => {
                    if(res.status === 200) {
                        showToast(t(res.data.message));
                        clear();

                        api.get('/get-cart-boxes', { headers: myHeaders })
                        .then((res) => {
                            if(res.status === 200){
                                updateBoxes(res.data);
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
    }, [clear, currentBoxType?.id, logged, maximumNumber, slices, totalNumber, updateBoxes, userId]);

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
                    <IonIcon icon={reload}></IonIcon>
                </IonButton>
            </div>
        </IonButtons>
        // {/* end::Buttons */}
    );
};

export default Menu;
