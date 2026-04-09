import { IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonItem, IonLabel, IonInput } from "@ionic/react";
import { useRef } from "react";
import { OrderDetail } from "./OrderDetail";
import { useTranslation } from "react-i18next";
import { OrderProps } from "./Order";

export const OrderDetailModal:React.FC<OrderProps>=(order)=>{
  const { t } = useTranslation();

    const modal = useRef<HTMLIonModalElement>(null);

    return (
        <IonModal ref={modal} trigger={"show-modal"+order.id} initialBreakpoint={0.25} breakpoints={[0, 0.25, 0.75]}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => modal.current?.dismiss()} color="primary">Cancel</IonButton>
              </IonButtons>
              <IonTitle>{('Détails commande')}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="">
            <OrderDetail {...order}/>
          </IonContent>
        </IonModal>
    );
}