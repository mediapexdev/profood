import React, { useMemo, useState } from 'react';

import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonToolbar,
    IonLabel
} from '@ionic/react';

import { useTranslation } from 'react-i18next';

import { useDataContext } from '../../contexts/DataProvider';
import { normalizeString } from '../../helpers/AssetHelpers';
import SearchResults from './components/SearchResults';
import useToggleTabBar from '../../components/hooks/useToggleTabBar';

import './SearchPage.css';

/**
 * Search result types
 */
export type SearchTab = 'all' | 'boxes' | 'slices' | 'categories';

/**
 * SearchPage component - Allows users to search across all products
 */
const SearchPage: React.FC = () => {
    /**
     * Translation hook
     */
    const { t } = useTranslation();

    /**
     * Toggle tab bar visibility
     */
    const toggleTabBar = useToggleTabBar();

    /**
     * Show tab bar when entering search page
     */
    React.useEffect(() => {
        toggleTabBar(true);
    }, [toggleTabBar]);

    /**
     * Search input state
     */
    const [searchText, setSearchText] = useState<string>('');

    /**
     * Active filter tab
     */
    const [activeTab, setActiveTab] = useState<SearchTab>('all');

    /**
     * Get product data from context
     */
    const { boxTypesProps, slicesProps, categoriesProps } = useDataContext();

    /**
     * Filter results based on search text
     * Memoized to prevent unnecessary recalculations
     */
    const filteredResults = useMemo(() => {
        const query = normalizeString(searchText);

        if (!query || query.length < 2) {
            return { boxes: [], slices: [], categories: [] };
        }

        return {
            boxes: boxTypesProps.filter(box =>
                normalizeString(box.wording).includes(query)
            ),
            slices: slicesProps.filter(slice =>
                normalizeString(slice.wording).includes(query) ||
                normalizeString(slice.category.wording).includes(query)
            ),
            categories: categoriesProps.filter(category =>
                normalizeString(category.wording).includes(query)
            )
        };
    }, [searchText, boxTypesProps, slicesProps, categoriesProps]);

    /**
     * Total count of results
     */
    const totalResults = useMemo(() => {
        return filteredResults.boxes.length +
               filteredResults.slices.length +
               filteredResults.categories.length;
    }, [filteredResults]);

    /**
     * Handle search input change
     */
    const handleSearchChange = (e: CustomEvent) => {
        setSearchText(e.detail.value || '');
    };

    /**
     * Handle tab change
     */
    const handleTabChange = (e: CustomEvent) => {
        setActiveTab(e.detail.value as SearchTab);
    };

    return (
        <IonPage id="searchPage">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/views/home" text="" />
                    </IonButtons>
                    <IonSearchbar
                        value={searchText}
                        onIonInput={handleSearchChange}
                        placeholder={t('Rechercher un produit...')}
                        debounce={300}
                        animated={true}
                        showClearButton="focus"
                        className="search-input"
                    />
                </IonToolbar>
                <IonToolbar className="segment-toolbar">
                    <IonSegment
                        value={activeTab}
                        onIonChange={handleTabChange}
                        className="search-segment"
                    >
                        <IonSegmentButton value="all">
                            <IonLabel>{t('Tout')}</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="boxes">
                            <IonLabel>{t('Boxes')}</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="slices">
                            <IonLabel>{t('Découpes')}</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="categories">
                            <IonLabel>{t('Catégories')}</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <SearchResults
                    results={filteredResults}
                    activeTab={activeTab}
                    searchText={searchText}
                    totalResults={totalResults}
                />
            </IonContent>
        </IonPage>
    );
};

export default SearchPage;
