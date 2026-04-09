import { IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonIcon } from "@ionic/react";
import { OrderProps } from "./Order";
import { useTranslation } from "react-i18next";

import './OrderDetail.css';

/**
 * 
 * @param order 
 * @returns 
 */
export const OrderDetail:React.FC<OrderProps>=(order)=>{
    const { t } = useTranslation();

    console.log(order)
    return(
        <IonCard className="order-details">
            <IonCardTitle>
                <span> {t('Montant:')} {order.montant} f cfa</span>
            </IonCardTitle>
            <IonCardSubtitle>
                <span>{t('Adresse:')} {order.address}</span><br />
                <span>{t('Nombre boxes:')} {order.cart.boxes_data.length}</span><br />
                <span>{t('Nombre de découpes: ')}{order.cart.slices_data.length}</span>
            </IonCardSubtitle>
            <IonCardContent>
    <div className="padding">
        <div className="row">           
            <div className="col-lg-6">
                <p>{t('Suivi commande')}</p>
                <div className="timeline p-2 block mb-2">
                    <div className="tl-item active">
                        <div className="tl-dot b-warning"></div>
                        <div className="tl-content">
                            <div className="">{t('Commande validée.')}</div>
                            <div className="tl-date text-muted mt-1">13 june 18</div>
                        </div>
                    </div>
                    <div className="tl-item active">
                        <div className="tl-dot b-warning"></div>
                        <div className="tl-content">
                            <div className="">{t('Paiement effectué.')}</div>
                            <div className="tl-date text-muted mt-1">13 june 18</div>
                        </div>
                    </div>
                    <div className="tl-item">
                        <div className="tl-dot b-primary"></div>
                        <div className="tl-content">
                            <div className="">{t('Mise en condition')}</div>
                            <div className="tl-date text-muted mt-1">45 minutes ago</div>
                        </div>
                    </div>
                    <div className="tl-item">
                        <div className="tl-dot b-danger"></div>
                        <div className="tl-content">
                            <div className="">{t('Début Livraison ')}</div>
                            <div className="tl-date text-muted mt-1">1 day ago</div>
                        </div>
                    </div>
                    <div className="tl-item">
                        <div className="tl-dot b-danger"></div>
                        <div className="tl-content">
                            <div className="">{t('Fin Livraison')}</div>
                            <div className="tl-date text-muted mt-1">1 Week ago</div>
                        </div>
                    </div>
                </div>
            </div>
            
        
        </div>
    </div>
            </IonCardContent>
        </IonCard>
    );
}