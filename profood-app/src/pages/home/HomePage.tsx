import React from 'react';

import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    RefresherEventDetail,
    useIonViewDidEnter,
    useIonViewDidLeave
} from '@ionic/react';

import Header from './layout/Header';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import FeaturedBoxes from './components/FeaturedBoxes';
import CategoryBanner from './components/CategoryBanner';
import PopularSlices from './components/PopularSlices';
import TrustBanner from './components/TrustBanner';
// import Testimonials from './components/Testimonials';
import FooterCTA from './components/FooterCTA';
import useToggleTabBar from '../../components/hooks/useToggleTabBar';
import { useDataContext } from '../../contexts/DataProvider';
import { useUIStateContext } from '../../contexts/UIStateProvider';

import './HomePage.css';

/**
 * HomePage - Main landing page showcasing products and categories
 *
 * Structure:
 * 1. Hero Section - Value proposition and CTAs
 * 2. How It Works - Explains the Box concept
 * 3. Featured Boxes - Box types carousel with enhanced info
 * 4. Category Banner - Browse by individual slices
 * 5. Popular Slices - Best-selling individual products
 * 6. Trust Banner - Why choose Profood (Halal, delivery, etc.)
 * 7. Testimonials - Customer reviews
 * 8. Footer CTA - Final call to action
 */
const HomePage: React.FC = () => {
    /**
     * Toggle tab bar visibility
     */
    const toggleTabBar = useToggleTabBar();

    /**
     * UI state for showing prices
     */
    const { setShowSlicePrice } = useUIStateContext();

    /**
     * Show tab bar and enable slice prices when entering home page
     */
    useIonViewDidEnter(() => {
        toggleTabBar(true);
        setShowSlicePrice(true);
    });

    /**
     * Reset slice price display when leaving
     */
    useIonViewDidLeave(() => {
        setShowSlicePrice(false);
    });

    /**
     * Get product data from context
     */
    const { boxTypesProps, categoriesProps, slicesProps } = useDataContext();

    /**
     * Handle pull-to-refresh
     */
    const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        setTimeout(() => {
            window.location.reload();
            event.detail.complete();
        }, 2000);
    };

    return (
        <IonPage id='homePage'>
            <Header />
            <IonContent id='homePageContent'>
                <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                {/* 1. Hero Section - Full width, outside container */}
                <HeroSection />

                <div className="app-container">
                    {/* 2. How It Works - Explains the ordering process */}
                    <HowItWorks />

                    {/* 3. Featured Boxes Carousel - Enhanced with persons/savings */}
                    <FeaturedBoxes boxes={boxTypesProps} />

                    {/* 4. Category Banner - Buy individual slices */}
                    <CategoryBanner categories={categoriesProps} />

                    {/* 5. Popular Slices Carousel */}
                    <PopularSlices slices={slicesProps} />

                    {/* 6. Trust Banner - Why Profood (Halal, cold chain, etc.) */}
                    <TrustBanner />

                    {/* 7. Testimonials - Customer reviews (disabled for now)
                    <Testimonials /> */}

                    {/* 8. Footer CTA - Final call to action */}
                    <FooterCTA />
                </div>

            </IonContent>
        </IonPage>
    );
};

export default HomePage;
