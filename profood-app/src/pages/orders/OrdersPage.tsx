import React, { createContext, useCallback, useMemo, useState } from "react";

import { IonContent, IonPage, useIonViewDidEnter } from "@ionic/react";

import Body from "./layout/Body";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import useToggleTabBar from "../../components/hooks/useToggleTabBar";

import './OrdersPage.css';

/**
 * Context type for orders menu tabs
 */
type OrdersMenuTabsContextType = {
    currentMenuTab: number;
    toggleMenuTab: (tabNumber: number) => void;
};

/**
 * Orders menu tabs context - local to OrdersPage
 * No need for a separate provider file since it's only used in this page
 */
export const OrdersMenuTabsContext = createContext<OrdersMenuTabsContextType>({
    currentMenuTab: 1,
    toggleMenuTab: () => {/* */}
});

/**
 * Orders page component with local tab state management
 * @returns OrdersPage component
 */
const OrdersPage: React.FC = () => {
    /**
     * Local state for current menu tab
     */
    const [currentMenuTab, setCurrentMenuTab] = useState<number>(1);

    /**
     * Toggle tab bar visibility hook
     */
    const toggleTabBar = useToggleTabBar();

    /**
     * Toggle menu tab callback
     */
    const toggleMenuTab = useCallback((tabNumber: number) => setCurrentMenuTab(tabNumber), []);

    /**
     * Memoized context value to prevent unnecessary re-renders
     */
    const contextValue = useMemo(() => ({ currentMenuTab, toggleMenuTab }), [currentMenuTab, toggleMenuTab]);

    /**
     * Show tab bar when entering orders page
     */
    useIonViewDidEnter(() => {
        toggleTabBar(true);
    });

    return(
        <OrdersMenuTabsContext.Provider value={contextValue}>
            <IonPage>
                <Header/>
                <IonContent>
                    <Body />
                </IonContent>
                <Footer />
            </IonPage>
        </OrdersMenuTabsContext.Provider>
    );
};

export default OrdersPage;
