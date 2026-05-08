import React, { useCallback, useMemo, useState } from 'react';

import {
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonRange,
    IonSelect,
    IonSelectOption,
    IonText,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonContent as IonModalContent,
    IonNote
} from '@ionic/react';
import {
    closeCircle,
    filterOutline,
    searchOutline,
    swapVerticalOutline,
    pricetagOutline,
    layersOutline,
    cartOutline
} from 'ionicons/icons';

import { useTranslation } from 'react-i18next';

import { BoxTypeProps } from '../../../components/box/BoxType';
import { CategoryProps } from '../../../components/categories/Category';
import { SliceProps } from '../../../components/slices/Slice';
import PriceDisplay from '../../../components/price/PriceDisplay';
import { formatNumber } from '../../../helpers/AssetHelpers';
import useGoTo from '../../../components/hooks/useGoTo';
import { useLoadingSpinnerContext } from '../../../contexts/LoadingSpinnerProvider';
import CategoryProvider, { useCategoryContext } from '../../../contexts/CategoryProvider';
import SlicesHandlersContext, { SlicesHandlersContextType } from '../../../contexts/SlicesHandlersContext';
import { useUIStateContext } from '../../../contexts/UIStateProvider';

import './SearchResults.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Possible sort orders for search results.
 * Note: 'newest' sorts by ID descending as a proxy because neither BoxTypeProps
 * nor SliceProps expose a created_at field from the API — see data shape gap.
 */
export type SortOrder =
    | 'default'
    | 'price_asc'
    | 'price_desc'
    | 'newest';

interface FilterState {
    /** ID of the selected category chip, or null for "all" */
    categoryId: number | null;
    /** Minimum price in FCFA (0 = no lower bound) */
    priceMin: number;
    /** Maximum price in FCFA (0 = no upper bound) */
    priceMax: number;
    /** Whether to show only items available in a box */
    availableInBoxOnly: boolean;
}

export interface SearchResultsProps {
    results: {
        boxes: BoxTypeProps[];
        slices: SliceProps[];
        categories: CategoryProps[];
    };
    activeTab: 'all' | 'boxes' | 'slices' | 'categories';
    searchText: string;
    totalResults: number;
}

// ---------------------------------------------------------------------------
// Price helper — resolves promotional or regular price
// ---------------------------------------------------------------------------

/**
 * Returns the effective price for a box or slice, respecting promotional pricing.
 * Used as the comparison value for price-range filtering and sorting.
 */
const getEffectivePrice = (item: BoxTypeProps | SliceProps): number => {
    if (item.is_on_promotion && item.promotional_price) {
        return item.promotional_price;
    }
    // effective_price is a computed field the API may include
    if (item.effective_price) {
        return item.effective_price;
    }
    return item.price;
};

// ---------------------------------------------------------------------------
// Default price-range cap
// ---------------------------------------------------------------------------

/** Upper bound shown in the range slider before any data is loaded (FCFA) */
const DEFAULT_PRICE_CAP = 50000;

// ---------------------------------------------------------------------------
// Inner component — wraps the results with the slice-selection context
// (required because the Slice component reads SlicesHandlersContext)
// ---------------------------------------------------------------------------

const SearchResultsInner: React.FC<SearchResultsProps> = ({
    results,
    activeTab,
    searchText,
    totalResults
}) => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const { setShowSpinner } = useLoadingSpinnerContext();
    const { showSlicePrice } = useUIStateContext();

    // Wire the slice add/remove/getQuantity handlers from CategoryProvider
    const { add, remove, getQuantity } = useCategoryContext();
    const sliceHandlers: SlicesHandlersContextType = { add, remove, getQuantity };

    // -----------------------------------------------------------------------
    // Filter & sort state
    // -----------------------------------------------------------------------

    const [filterState, setFilterState] = useState<FilterState>({
        categoryId: null,
        priceMin: 0,
        priceMax: 0,
        availableInBoxOnly: false
    });

    const [sortOrder, setSortOrder] = useState<SortOrder>('default');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // -----------------------------------------------------------------------
    // Derive price bounds from current result set so the range slider is
    // meaningful even before the user types anything
    // -----------------------------------------------------------------------

    const priceBounds = useMemo(() => {
        const allPrices: number[] = [
            ...results.boxes.map(getEffectivePrice),
            ...results.slices.map(getEffectivePrice)
        ];
        if (allPrices.length === 0) return { min: 0, max: DEFAULT_PRICE_CAP };
        return {
            min: Math.min(...allPrices),
            max: Math.max(...allPrices)
        };
    }, [results.boxes, results.slices]);

    // -----------------------------------------------------------------------
    // Derive unique categories from current slice results for filter chips
    // -----------------------------------------------------------------------

    const availableCategories = useMemo(() => {
        const seen = new Set<number>();
        const cats: CategoryProps[] = [];
        for (const slice of results.slices) {
            if (!seen.has(slice.category.id)) {
                seen.add(slice.category.id);
                cats.push(slice.category);
            }
        }
        return cats;
    }, [results.slices]);

    // -----------------------------------------------------------------------
    // Apply filters to each result group
    // -----------------------------------------------------------------------

    const filteredBoxes = useMemo(() => {
        return results.boxes
            .filter(box => {
                const price = getEffectivePrice(box);
                if (filterState.priceMin > 0 && price < filterState.priceMin) return false;
                if (filterState.priceMax > 0 && price > filterState.priceMax) return false;
                return true;
            })
            .sort((a, b) => {
                switch (sortOrder) {
                    case 'price_asc': return getEffectivePrice(a) - getEffectivePrice(b);
                    case 'price_desc': return getEffectivePrice(b) - getEffectivePrice(a);
                    // 'newest': sort by ID descending — a proxy for insertion order
                    // because BoxTypeProps has no created_at field exposed by the API
                    case 'newest': return b.id - a.id;
                    default: return 0;
                }
            });
    }, [results.boxes, filterState, sortOrder]);

    const filteredSlices = useMemo(() => {
        return results.slices
            .filter(slice => {
                if (filterState.categoryId !== null && slice.category.id !== filterState.categoryId) {
                    return false;
                }
                const price = getEffectivePrice(slice);
                if (filterState.priceMin > 0 && price < filterState.priceMin) return false;
                if (filterState.priceMax > 0 && price > filterState.priceMax) return false;
                if (filterState.availableInBoxOnly && !slice.available_in_box) return false;
                return true;
            })
            .sort((a, b) => {
                switch (sortOrder) {
                    case 'price_asc': return getEffectivePrice(a) - getEffectivePrice(b);
                    case 'price_desc': return getEffectivePrice(b) - getEffectivePrice(a);
                    // 'newest': sort by ID descending — a proxy for insertion order
                    // because SliceProps has no created_at field exposed by the API
                    case 'newest': return b.id - a.id;
                    default: return 0;
                }
            });
    }, [results.slices, filterState, sortOrder]);

    const filteredCategories = useMemo(() => {
        // Categories are not price-filterable; only sort is relevant
        return [...results.categories].sort((a, b) => {
            if (sortOrder === 'newest') return b.id - a.id;
            return 0;
        });
    }, [results.categories, sortOrder]);

    // -----------------------------------------------------------------------
    // Total count after filters
    // -----------------------------------------------------------------------

    const filteredTotal = useMemo(() => {
        switch (activeTab) {
            case 'boxes': return filteredBoxes.length;
            case 'slices': return filteredSlices.length;
            case 'categories': return filteredCategories.length;
            default: return filteredBoxes.length + filteredSlices.length + filteredCategories.length;
        }
    }, [activeTab, filteredBoxes, filteredSlices, filteredCategories]);

    // -----------------------------------------------------------------------
    // Active filter count (for badge on the filter button)
    // -----------------------------------------------------------------------

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterState.categoryId !== null) count++;
        if (filterState.priceMin > 0 || filterState.priceMax > 0) count++;
        if (filterState.availableInBoxOnly) count++;
        return count;
    }, [filterState]);

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    const navigate = useCallback((path: string) => {
        setShowSpinner(true);
        setTimeout(() => setShowSpinner(false), 1000);
        goTo(path, 'none', 'push');
    }, [goTo, setShowSpinner]);

    const resetFilters = useCallback(() => {
        setFilterState({
            categoryId: null,
            priceMin: 0,
            priceMax: 0,
            availableInBoxOnly: false
        });
    }, []);

    // -----------------------------------------------------------------------
    // Determine whether we should show results at all
    // -----------------------------------------------------------------------

    const hasSearchText = searchText.trim().length >= 2;

    // -----------------------------------------------------------------------
    // Empty / idle states
    // -----------------------------------------------------------------------

    if (!hasSearchText) {
        return (
            <div className="search-idle-state" role="status" aria-live="polite">
                <IonIcon icon={searchOutline} className="search-idle-icon" aria-hidden="true" />
                <IonText color="medium">
                    <p className="search-idle-text">{t('Rechercher un produit...')}</p>
                </IonText>
            </div>
        );
    }

    if (totalResults === 0) {
        return (
            <div className="search-empty-state" role="status" aria-live="polite">
                <IonIcon icon={searchOutline} className="search-empty-icon" aria-hidden="true" />
                <IonText color="dark">
                    <h3 className="search-empty-title">{t('Aucun produit trouvé')}</h3>
                </IonText>
                <IonText color="medium">
                    <p className="search-empty-hint">{t('Essayez avec un autre mot-clé')}</p>
                </IonText>
            </div>
        );
    }

    if (filteredTotal === 0 && activeFilterCount > 0) {
        return (
            <>
                <SearchToolbar
                    t={t}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    activeFilterCount={activeFilterCount}
                    onOpenFilters={() => setIsFilterModalOpen(true)}
                />
                <div className="search-empty-state" role="status" aria-live="polite">
                    <IonIcon icon={filterOutline} className="search-empty-icon" aria-hidden="true" />
                    <IonText color="dark">
                        <h3 className="search-empty-title">{t('Aucun résultat pour ces filtres')}</h3>
                    </IonText>
                    <IonButton
                        fill="outline"
                        size="small"
                        onClick={resetFilters}
                        className="search-clear-filters-btn"
                    >
                        {t('Effacer les filtres')}
                    </IonButton>
                </div>
                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    filterState={filterState}
                    onFilterChange={setFilterState}
                    priceBounds={priceBounds}
                    availableCategories={availableCategories}
                    activeTab={activeTab}
                    t={t}
                />
            </>
        );
    }

    // -----------------------------------------------------------------------
    // Main results view
    // -----------------------------------------------------------------------

    return (
        <SlicesHandlersContext.Provider value={sliceHandlers}>
            {/* Toolbar: sort selector + filter button */}
            <SearchToolbar
                t={t}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                activeFilterCount={activeFilterCount}
                onOpenFilters={() => setIsFilterModalOpen(true)}
            />

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
                <div className="search-active-chips" role="group" aria-label={t('Filtres actifs')}>
                    {filterState.categoryId !== null && (
                        <IonChip
                            color="primary"
                            onClick={() => setFilterState(s => ({ ...s, categoryId: null }))}
                        >
                            <IonLabel>
                                {availableCategories.find(c => c.id === filterState.categoryId)?.wording ?? t('Catégorie')}
                            </IonLabel>
                            <IonIcon icon={closeCircle} aria-label={t('Retirer ce filtre')} />
                        </IonChip>
                    )}
                    {(filterState.priceMin > 0 || filterState.priceMax > 0) && (
                        <IonChip
                            color="primary"
                            onClick={() => setFilterState(s => ({ ...s, priceMin: 0, priceMax: 0 }))}
                        >
                            <IonLabel>
                                {filterState.priceMin > 0 && filterState.priceMax > 0
                                    ? `${formatNumber(filterState.priceMin)} – ${formatNumber(filterState.priceMax)} Fcfa`
                                    : filterState.priceMin > 0
                                        ? `≥ ${formatNumber(filterState.priceMin)} Fcfa`
                                        : `≤ ${formatNumber(filterState.priceMax)} Fcfa`
                                }
                            </IonLabel>
                            <IonIcon icon={closeCircle} aria-label={t('Retirer ce filtre')} />
                        </IonChip>
                    )}
                    {filterState.availableInBoxOnly && (
                        <IonChip
                            color="primary"
                            onClick={() => setFilterState(s => ({ ...s, availableInBoxOnly: false }))}
                        >
                            <IonLabel>{t('Disponible en Box')}</IonLabel>
                            <IonIcon icon={closeCircle} aria-label={t('Retirer ce filtre')} />
                        </IonChip>
                    )}
                </div>
            )}

            {/* Box results section */}
            {(activeTab === 'all' || activeTab === 'boxes') && filteredBoxes.length > 0 && (
                <section className="search-section" aria-labelledby="search-section-boxes">
                    {activeTab === 'all' && (
                        <div className="search-section-header">
                            <IonText>
                                <h2 id="search-section-boxes" className="search-section-title">
                                    {t('Boxes')}
                                    <IonBadge color="primary" className="search-section-badge">
                                        {filteredBoxes.length}
                                    </IonBadge>
                                </h2>
                            </IonText>
                        </div>
                    )}
                    <IonList lines="none" className="search-results-list">
                        {filteredBoxes.map(box => (
                            <SearchBoxCard key={box.id} box={box} navigate={navigate} t={t} />
                        ))}
                    </IonList>
                </section>
            )}

            {/* Slice results section */}
            {(activeTab === 'all' || activeTab === 'slices') && filteredSlices.length > 0 && (
                <section className="search-section" aria-labelledby="search-section-slices">
                    {activeTab === 'all' && (
                        <div className="search-section-header">
                            <IonText>
                                <h2 id="search-section-slices" className="search-section-title">
                                    {t('Découpes')}
                                    <IonBadge color="primary" className="search-section-badge">
                                        {filteredSlices.length}
                                    </IonBadge>
                                </h2>
                            </IonText>
                        </div>
                    )}
                    {/* Category filter chips — only visible in slices tab or when all */}
                    {availableCategories.length > 1 && (
                        <div
                            className="search-category-chips"
                            role="group"
                            aria-label={t('Filtrer par catégorie')}
                        >
                            <IonChip
                                color={filterState.categoryId === null ? 'primary' : 'medium'}
                                onClick={() => setFilterState(s => ({ ...s, categoryId: null }))}
                                outline={filterState.categoryId !== null}
                            >
                                <IonLabel>{t('Tout')}</IonLabel>
                            </IonChip>
                            {availableCategories.map(cat => (
                                <IonChip
                                    key={cat.id}
                                    color={filterState.categoryId === cat.id ? 'primary' : 'medium'}
                                    onClick={() => setFilterState(s => ({
                                        ...s,
                                        categoryId: s.categoryId === cat.id ? null : cat.id
                                    }))}
                                    outline={filterState.categoryId !== cat.id}
                                >
                                    <IonLabel>{cat.wording}</IonLabel>
                                </IonChip>
                            ))}
                        </div>
                    )}
                    <IonList lines="none" className="search-results-list">
                        {filteredSlices.map(slice => (
                            <SearchSliceCard
                                key={slice.id}
                                slice={slice}
                                showPrice={showSlicePrice}
                                add={add}
                                remove={remove}
                                getQuantity={getQuantity}
                                t={t}
                            />
                        ))}
                    </IonList>
                </section>
            )}

            {/* Category results section */}
            {(activeTab === 'all' || activeTab === 'categories') && filteredCategories.length > 0 && (
                <section className="search-section" aria-labelledby="search-section-categories">
                    {activeTab === 'all' && (
                        <div className="search-section-header">
                            <IonText>
                                <h2 id="search-section-categories" className="search-section-title">
                                    {t('Catégories')}
                                    <IonBadge color="primary" className="search-section-badge">
                                        {filteredCategories.length}
                                    </IonBadge>
                                </h2>
                            </IonText>
                        </div>
                    )}
                    <IonList lines="none" className="search-results-list">
                        {filteredCategories.map(cat => (
                            <SearchCategoryCard key={cat.id} category={cat} navigate={navigate} t={t} />
                        ))}
                    </IonList>
                </section>
            )}

            {/* Filter modal */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filterState={filterState}
                onFilterChange={setFilterState}
                priceBounds={priceBounds}
                availableCategories={availableCategories}
                activeTab={activeTab}
                t={t}
            />
        </SlicesHandlersContext.Provider>
    );
};

// ---------------------------------------------------------------------------
// SearchToolbar — sort selector + filter button
// ---------------------------------------------------------------------------

interface SearchToolbarProps {
    t: (key: string) => string;
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
    activeFilterCount: number;
    onOpenFilters: () => void;
}

const SearchToolbar: React.FC<SearchToolbarProps> = ({
    t,
    sortOrder,
    onSortChange,
    activeFilterCount,
    onOpenFilters
}) => (
    <div className="search-toolbar" role="toolbar" aria-label={t('Outils de recherche')}>
        {/* Sort selector */}
        <div className="search-sort-wrapper">
            <IonIcon icon={swapVerticalOutline} className="search-toolbar-icon" aria-hidden="true" />
            <IonSelect
                value={sortOrder}
                onIonChange={e => onSortChange(e.detail.value as SortOrder)}
                interface="popover"
                className="search-sort-select"
                aria-label={t('Trier par')}
            >
                <IonSelectOption value="default">{t('Pertinence')}</IonSelectOption>
                <IonSelectOption value="price_asc">{t('Prix croissant')}</IonSelectOption>
                <IonSelectOption value="price_desc">{t('Prix décroissant')}</IonSelectOption>
                <IonSelectOption value="newest">{t('Nouveautés')}</IonSelectOption>
            </IonSelect>
        </div>

        {/* Filter button */}
        <IonButton
            fill={activeFilterCount > 0 ? 'solid' : 'outline'}
            size="small"
            color="primary"
            onClick={onOpenFilters}
            className="search-filter-btn"
            aria-label={`${t('Filtres')}${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
        >
            <IonIcon slot="start" icon={filterOutline} aria-hidden="true" />
            {t('Filtres')}
            {activeFilterCount > 0 && (
                <IonBadge color="danger" className="search-filter-badge">{activeFilterCount}</IonBadge>
            )}
        </IonButton>
    </div>
);

// ---------------------------------------------------------------------------
// SearchBoxCard — displays a box type result item
// ---------------------------------------------------------------------------

interface SearchBoxCardProps {
    box: BoxTypeProps;
    navigate: (path: string) => void;
    t: (key: string) => string;
}

const SearchBoxCard: React.FC<SearchBoxCardProps> = ({ box, navigate, t }) => (
    <IonItem
        className="search-result-item"
        lines="none"
        button={false}
        detail={false}
    >
        <IonCard className="search-card search-card--box" onClick={() => navigate(`/slices/typeBox/${box.id}`)}>
            <div className="search-card-image-wrapper">
                <img
                    src={box.illustration}
                    alt={box.wording}
                    className="search-card-image"
                    loading="lazy"
                />
                {box.is_on_promotion && box.discount_percentage && (
                    <div className="search-promo-badge">-{box.discount_percentage}%</div>
                )}
            </div>
            <IonCardContent className="search-card-content">
                <div className="search-card-type-badge">
                    <IonIcon icon={layersOutline} className="search-card-type-icon" aria-hidden="true" />
                    <span>Box</span>
                </div>
                <IonCardTitle className="search-card-title">{box.wording}</IonCardTitle>
                <IonCardSubtitle className="search-card-subtitle">
                    {box.capacity} {t('découpes')}
                </IonCardSubtitle>
                <div className="search-card-footer">
                    <PriceDisplay
                        price={box.price}
                        promotionalPrice={box.promotional_price}
                        isOnPromotion={box.is_on_promotion}
                        discountPercentage={box.discount_percentage}
                        size="small"
                    />
                    <IonButton
                        fill="solid"
                        size="small"
                        color="primary"
                        onClick={e => {
                            e.stopPropagation();
                            navigate(`/slices/typeBox/${box.id}`);
                        }}
                        className="search-card-cta"
                        aria-label={`${t('Acheter')} ${box.wording}`}
                    >
                        {t('Acheter')}
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    </IonItem>
);

// ---------------------------------------------------------------------------
// SearchSliceCard — displays a slice result with add-to-cart controls
// ---------------------------------------------------------------------------

interface SearchSliceCardProps {
    slice: SliceProps;
    showPrice: boolean;
    add: (item: { id: number; quantity: number }) => void;
    remove: (id: number) => void;
    getQuantity: (id: number) => number;
    t: (key: string) => string;
}

const SearchSliceCard: React.FC<SearchSliceCardProps> = ({
    slice,
    showPrice,
    add,
    remove,
    getQuantity,
    t
}) => {
    const quantity = getQuantity(slice.id);

    /**
     * Optimistic add: immediately reflects +1 quantity in the UI via context
     * before any network call (the actual cart sync is handled upstream).
     */
    const handleAdd = useCallback(() => {
        add({ id: slice.id, quantity: 1 });
    }, [add, slice.id]);

    const handleRemove = useCallback(() => {
        remove(slice.id);
    }, [remove, slice.id]);

    return (
        <IonItem className="search-result-item" lines="none" button={false} detail={false}>
            <IonCard className="search-card search-card--slice">
                <div className="search-card-image-wrapper">
                    <img
                        src={slice.illustration}
                        alt={slice.wording}
                        className="search-card-image"
                        loading="lazy"
                    />
                    {slice.is_on_promotion && slice.discount_percentage && (
                        <div className="search-promo-badge">-{slice.discount_percentage}%</div>
                    )}
                </div>
                <IonCardContent className="search-card-content">
                    <div className="search-card-type-badge">
                        <IonIcon icon={pricetagOutline} className="search-card-type-icon" aria-hidden="true" />
                        <span>{slice.category.wording}</span>
                    </div>
                    <IonCardTitle className="search-card-title">{t(slice.wording)}</IonCardTitle>
                    {showPrice ? (
                        <PriceDisplay
                            price={slice.price}
                            promotionalPrice={slice.promotional_price}
                            isOnPromotion={slice.is_on_promotion}
                            discountPercentage={slice.discount_percentage}
                            size="small"
                        />
                    ) : (
                        <IonCardSubtitle className="search-card-subtitle">
                            {formatNumber(slice.weight)} kg
                        </IonCardSubtitle>
                    )}
                    <div className="search-card-footer">
                        {/* Quantity controls with optimistic UI updates */}
                        {quantity > 0 ? (
                            <div className="search-qty-controls" role="group" aria-label={`${t('Quantité')} ${slice.wording}`}>
                                <button
                                    className="search-qty-btn"
                                    onClick={handleRemove}
                                    aria-label={t('Retirer une unité')}
                                    type="button"
                                >
                                    −
                                </button>
                                <span className="search-qty-value" aria-live="polite">{quantity}</span>
                                <button
                                    className="search-qty-btn"
                                    onClick={handleAdd}
                                    aria-label={t('Ajouter une unité')}
                                    type="button"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <IonButton
                                fill="solid"
                                size="small"
                                color="primary"
                                onClick={handleAdd}
                                className="search-card-cta"
                                aria-label={`${t('Ajouter au panier')} ${slice.wording}`}
                            >
                                <IonIcon slot="start" icon={cartOutline} aria-hidden="true" />
                                {t('Ajouter')}
                            </IonButton>
                        )}
                    </div>
                </IonCardContent>
            </IonCard>
        </IonItem>
    );
};

// ---------------------------------------------------------------------------
// SearchCategoryCard — displays a category result item
// ---------------------------------------------------------------------------

interface SearchCategoryCardProps {
    category: CategoryProps;
    navigate: (path: string) => void;
    t: (key: string) => string;
}

const SearchCategoryCard: React.FC<SearchCategoryCardProps> = ({ category, navigate, t }) => (
    <IonItem className="search-result-item" lines="none" button={false} detail={false}>
        <IonCard
            className="search-card search-card--category"
            onClick={() => navigate(`/slices/category/${category.id}`)}
        >
            <div className="search-card-image-wrapper search-card-image-wrapper--category">
                <img
                    src={category.illustration}
                    alt={category.wording}
                    className="search-card-image"
                    loading="lazy"
                />
            </div>
            <IonCardContent className="search-card-content">
                <IonCardTitle className="search-card-title">{t(category.wording)}</IonCardTitle>
                <IonCardSubtitle className="search-card-subtitle">
                    {formatNumber(category.slices_count)} {t('produits')}
                </IonCardSubtitle>
                <div className="search-card-footer">
                    <IonButton
                        fill="outline"
                        size="small"
                        color="primary"
                        onClick={e => {
                            e.stopPropagation();
                            navigate(`/slices/category/${category.id}`);
                        }}
                        className="search-card-cta"
                        aria-label={`${t('Choisir')} ${category.wording}`}
                    >
                        {t('Choisir')}
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    </IonItem>
);

// ---------------------------------------------------------------------------
// FilterModal — IonModal with price range slider and availability toggle
// ---------------------------------------------------------------------------

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filterState: FilterState;
    onFilterChange: (state: FilterState) => void;
    priceBounds: { min: number; max: number };
    availableCategories: CategoryProps[];
    activeTab: string;
    t: (key: string) => string;
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    filterState,
    onFilterChange,
    priceBounds,
    availableCategories,
    activeTab,
    t
}) => {
    // Local draft state so the user can cancel without applying changes
    const [draft, setDraft] = useState<FilterState>(filterState);

    // Sync draft when modal opens or external filters change
    React.useEffect(() => {
        if (isOpen) setDraft(filterState);
    }, [isOpen, filterState]);

    const handleApply = useCallback(() => {
        onFilterChange(draft);
        onClose();
    }, [draft, onFilterChange, onClose]);

    const handleReset = useCallback(() => {
        const cleared: FilterState = {
            categoryId: null,
            priceMin: 0,
            priceMax: 0,
            availableInBoxOnly: false
        };
        setDraft(cleared);
        onFilterChange(cleared);
        onClose();
    }, [onFilterChange, onClose]);

    // Effective slider bounds
    const sliderMax = priceBounds.max > 0 ? priceBounds.max : DEFAULT_PRICE_CAP;
    const currentMin = draft.priceMin > 0 ? draft.priceMin : priceBounds.min;
    const currentMax = draft.priceMax > 0 ? draft.priceMax : sliderMax;

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            initialBreakpoint={0.7}
            breakpoints={[0, 0.7, 1]}
            className="search-filter-modal"
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{t('Filtres')}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose} aria-label={t('Fermer')}>
                            <IonIcon icon={closeCircle} aria-hidden="true" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonModalContent className="search-filter-content">
                {/* Price range */}
                <div className="search-filter-section">
                    <IonText>
                        <h3 className="search-filter-section-title">{t('Fourchette de prix')}</h3>
                    </IonText>
                    <div className="search-filter-price-labels">
                        <IonNote>{formatNumber(currentMin)} Fcfa</IonNote>
                        <IonNote>{formatNumber(currentMax)} Fcfa</IonNote>
                    </div>
                    {/*
                     * IonRange dual-knob: lower knob sets priceMin, upper knob sets priceMax.
                     * We use dualKnob={true} which exposes { lower, upper } in e.detail.value.
                     */}
                    <IonRange
                        dualKnobs={true}
                        min={priceBounds.min}
                        max={sliderMax}
                        step={500}
                        value={{ lower: currentMin, upper: currentMax }}
                        onIonChange={e => {
                            const val = e.detail.value as { lower: number; upper: number };
                            setDraft(d => ({
                                ...d,
                                priceMin: val.lower > priceBounds.min ? val.lower : 0,
                                priceMax: val.upper < sliderMax ? val.upper : 0
                            }));
                        }}
                        color="primary"
                        className="search-price-range"
                        aria-label={t('Fourchette de prix')}
                    />
                </div>

                {/* Category filter — only relevant when showing slices */}
                {(activeTab === 'all' || activeTab === 'slices') && availableCategories.length > 1 && (
                    <div className="search-filter-section">
                        <IonText>
                            <h3 className="search-filter-section-title">{t('Catégorie')}</h3>
                        </IonText>
                        <div className="search-category-chips">
                            <IonChip
                                color={draft.categoryId === null ? 'primary' : 'medium'}
                                onClick={() => setDraft(d => ({ ...d, categoryId: null }))}
                                outline={draft.categoryId !== null}
                            >
                                <IonLabel>{t('Tout')}</IonLabel>
                            </IonChip>
                            {availableCategories.map(cat => (
                                <IonChip
                                    key={cat.id}
                                    color={draft.categoryId === cat.id ? 'primary' : 'medium'}
                                    onClick={() => setDraft(d => ({
                                        ...d,
                                        categoryId: d.categoryId === cat.id ? null : cat.id
                                    }))}
                                    outline={draft.categoryId !== cat.id}
                                >
                                    <IonLabel>{cat.wording}</IonLabel>
                                </IonChip>
                            ))}
                        </div>
                    </div>
                )}

                {/* Availability filter */}
                {(activeTab === 'all' || activeTab === 'slices') && (
                    <div className="search-filter-section">
                        <IonText>
                            <h3 className="search-filter-section-title">{t('Disponibilité')}</h3>
                        </IonText>
                        <IonChip
                            color={draft.availableInBoxOnly ? 'primary' : 'medium'}
                            onClick={() => setDraft(d => ({ ...d, availableInBoxOnly: !d.availableInBoxOnly }))}
                            outline={!draft.availableInBoxOnly}
                        >
                            <IonLabel>{t('Disponible en Box')}</IonLabel>
                        </IonChip>
                    </div>
                )}

                {/* Action buttons */}
                <div className="search-filter-actions">
                    <IonButton
                        fill="outline"
                        expand="block"
                        onClick={handleReset}
                        className="search-filter-reset-btn"
                    >
                        {t('Effacer les filtres')}
                    </IonButton>
                    <IonButton
                        fill="solid"
                        expand="block"
                        color="primary"
                        onClick={handleApply}
                        className="search-filter-apply-btn"
                    >
                        {t('Appliquer')}
                    </IonButton>
                </div>
            </IonModalContent>
        </IonModal>
    );
};

// ---------------------------------------------------------------------------
// Public wrapper — provides CategoryProvider so Slice components can access
// add/remove/getQuantity handlers via SlicesHandlersContext
// ---------------------------------------------------------------------------

/**
 * SearchResults wraps SearchResultsInner in a CategoryProvider so that
 * slice quantity state is scoped to the search session and does not collide
 * with other pages' slice selection contexts.
 */
const SearchResults: React.FC<SearchResultsProps> = (props) => (
    <CategoryProvider>
        <SearchResultsInner {...props} />
    </CategoryProvider>
);

export default SearchResults;
