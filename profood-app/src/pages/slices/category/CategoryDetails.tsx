import React, { useEffect, useState } from "react";

import { IonBadge, IonCard, IonCardContent, IonLabel } from "@ionic/react";

import { useTranslation } from "react-i18next";

import Menu from "./layout/Menu";
import { CategoryProps } from "../../../components/categories/Category";
import { useCategoryContext } from "../../../contexts/CategoryProvider";
import { formatNumber } from "../../../helpers/AssetHelpers";

import './CategoryDetails.css';

/**
 * 
 * @param categoryProps 
 * @returns 
 */
const CategoryDetails: React.FC<CategoryProps> = (categoryProps : CategoryProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [selected_products_number, setSelectedProductsNumber] = useState(0);

    /**
     * 
     */
    const {totalNumber} = useCategoryContext();

    /**
     * 
     */
    useEffect(() => {
        setSelectedProductsNumber(totalNumber);
    }, [totalNumber]);

    /**
     * 
     */
    return (
        <IonCard className="category-details card translucent-style">
            <IonCardContent className="category-details-content card-body w-100">
                <div className="category-infos d-flex flex-column">
                    <div className="d-flex flex-wrap justify-content-start">
                        <div className="category-products-number-wrapper">
                            <span className="category-products-number content-color font-sm">{`${formatNumber(categoryProps.slices_count)} ${t('produits disponibles')}`}</span>
                        </div>
                    </div>
                    <div className="d-flex flex-row flex-stack mt-3 mb-2 fw-semibold">
                        <div className="choice-infos d-flex flex-row align-items-center justify-content-start">
                            <IonLabel>{t('Sélectionnés')}</IonLabel>
                            <IonBadge className="selected-products-number">{formatNumber(selected_products_number)}</IonBadge>
                        </div>
                        <Menu />
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default CategoryDetails;
