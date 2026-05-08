import React, { useCallback } from 'react';

import { IonImg } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import { CategoryProps } from '../../../components/categories/Category';
import useGoTo from '../../../components/hooks/useGoTo';
import { useLoadingSpinnerContext } from '../../../contexts/LoadingSpinnerProvider';

import './CategoryBanner.css';

/**
 * Props for CategoryBanner.
 *
 * `categories` is sourced from DataContext.categoriesProps.
 */
interface CategoryBannerProps {
    categories: CategoryProps[];
}

/**
 * CategoryBanner — grid of category tiles for browsing individual cuts.
 *
 * Dynamic: renders from DataContext.categoriesProps.  Shows skeleton
 * tiles while loading (empty array state from DataProvider init).
 *
 * Layout: 2-column grid on mobile, up to 4 columns on wider screens.
 * Tapping a tile navigates to /slices/category/:id.
 *
 * Placed after FeaturedBoxes to guide users who want to buy
 * individual cuts rather than a full Box.
 */
const CategoryBanner: React.FC<CategoryBannerProps> = ({ categories }) => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const { setShowSpinner } = useLoadingSpinnerContext();

    const handleNavigate = useCallback((id: number) => {
        setShowSpinner(true);
        setTimeout(() => setShowSpinner(false), 1000);
        goTo(`/slices/category/${id}`, 'none', 'push');
    }, [goTo, setShowSpinner]);

    const isLoading = categories.length === 0;

    return (
        <section className="category-banner-section home-section" aria-label={t('Catégories')}>
            {/* Section header */}
            <div className="category-banner-header">
                <h2 className="category-banner-heading">{t('Ou achetez à la découpe')}</h2>
                <p className="category-banner-sub">
                    {t("Pas besoin d'un Box complet ? Commandez à l'unité.")}
                </p>
            </div>

            {isLoading ? (
                /* Skeleton grid */
                <div className="category-grid" aria-busy="true" aria-label={t('Chargement...')}>
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="category-tile category-tile-skeleton">
                            <div className="cat-skeleton-img" />
                            <div className="cat-skeleton-label" />
                        </div>
                    ))}
                </div>
            ) : (
                /* Category grid */
                <div className="category-grid">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            className="category-tile"
                            onClick={() => handleNavigate(cat.id)}
                            aria-label={`${t(cat.wording)} — ${cat.slices_count} ${t('produits')}`}
                        >
                            {/* Image with text overlay */}
                            <div className="category-tile-img-wrap">
                                <IonImg
                                    src={cat.illustration}
                                    alt={t(cat.wording)}
                                    className="category-tile-img"
                                />
                                {/* Dark overlay so the label text is always readable */}
                                <div className="category-tile-overlay" aria-hidden="true" />
                            </div>

                            {/* Label */}
                            <div className="category-tile-label">
                                <span className="category-tile-name">{t(cat.wording)}</span>
                                <span className="category-tile-count">
                                    {cat.slices_count} {t('produits')}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CategoryBanner;
