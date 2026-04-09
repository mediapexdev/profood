import React, { useCallback } from "react";

import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle
} from "@ionic/react";

import { useTranslation } from "react-i18next";

import useGoTo from "../hooks/useGoTo";
import { formatNumber } from "../../helpers/AssetHelpers";
import { useLoadingSpinnerContext } from "../../contexts/LoadingSpinnerProvider";

import './Category.css';

/**
 * 
 */
export interface CategoryProps {
    id: number;
    wording: string;
    slices_count: number;
    illustration: string;
}

/**
 * 
 * @param category 
 * @returns 
 */
const Category: React.FC<CategoryProps> = (category: CategoryProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     * @param id 
     */
    const navigate = useCallback((id: number) => {
        setShowSpinner(true);
        setTimeout(() => {
            setShowSpinner(false);
        }, 1000);
		goTo(`/slices/category/${id}`, 'none', 'push');
	}, []);

    return (
        <IonCard className="category-widget card translucent-style">
            <div className="category-image-wrapper">
                <img
                    className="category-image blur-shadow position-start"
                    // src={toAbsolutePublicUrl('/media/images/illustrations/categories/' + category.id + '.jpg')}
                    src={category.illustration}
                    alt={t(category.wording)}
                />
                <img
                    className="category-image"
                    // src={toAbsolutePublicUrl('/media/images/illustrations/categories/' + category.id + '.jpg')}
                    src={category.illustration}
                    alt={t(category.wording)}
                />
            </div>
            <IonCardContent className="category-widget-content card-body">
                <div className="category-infos">
                    <div className="category-title-wrapper">
                        <IonCardTitle className="category-title card-title title-color font-md">{t(category.wording)}</IonCardTitle>
                    </div>
                    <div className="category-products-number-wrapper">
                        <IonCardSubtitle className="category-products-number content-color font-sm">{`${formatNumber(category.slices_count)} ${t('produits')}`}</IonCardSubtitle>
                    </div>
                </div>
                <div className="category-widget-buttons-wrapper">
                    <IonButton
                        type='button'
                        buttonType='button'
                        fill='solid'
                        size='small'
                        color='primary'
                        className="category-widget-button"
                        onClick={() => navigate(category.id)}
                    >
                        <span className="btn-text">{t("Choisir")}</span>
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default Category;
