import React, { useEffect, useState } from "react";

import { IonCard, IonCardContent } from "@ionic/react";

import { useTranslation } from "react-i18next";

import Menu from "./layout/Menu";
import { BoxTypeProps } from "../../../components/box/BoxType";
import { formatNumber } from "../../../helpers/AssetHelpers";
import { useBoxTypeContext } from "../../../contexts/BoxTypeProvider";
import CircularProgressBar from "../../../components/widgets/CircularProgressBar";

import './BoxTypeDetails.css';

/**
 * 
 * @param boxTypeProps
 * @returns 
 */
const BoxTypeDetails: React.FC<BoxTypeProps> = (boxTypeProps : BoxTypeProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [currentValue, setCurrentValue] = useState<number>(0);

    /**
     * 
     */
    const { totalNumber, setMaximumNumber } = useBoxTypeContext();

    /**
     * 
     */
    useEffect(() => {
        setMaximumNumber(boxTypeProps.capacity);
    }, [boxTypeProps]);

    /**
     * 
     */
    useEffect(() => {
        setCurrentValue(totalNumber);
    }, [totalNumber]);

    /**
     * 
     */
    return (
        <IonCard className="box-type-details card translucent-style">
            {/* <div className="box-type-image-wrapper">
                <img
                    className="box-type-image"
                    src={toAbsolutePublicUrl('/media/images/illustrations/boxes/' + boxTypeProps.id + '.jpg')}
                    alt={boxTypeProps.wording}
                />
            </div> */}
            {/* <div className="">
                <Menu />
            </div> */}
            <IonCardContent className="box-type-details-content card-body w-100">
                <div className="box-type-infos d-flex flex-column">
                    <div className="d-flex flex-wrap justify-content-start">
                        <div className="box-type-slices-number-wrapper">
                            <span className="box-type-slices-number content-color font-sm">{boxTypeProps.capacity} {t('découpes')}</span>
                        </div>
                        <div className="mx-3">-</div>
                        <div className="box-type-price-wrapper font-sm">
                            <span className='box-type-price'>{formatNumber(boxTypeProps.price)}</span>
                            <small className='box-type-price-currency'>Fcfa</small>
                        </div>
                    </div>
                    <div className="d-flex flex-row flex-stack mt-2 mb-0 fw-semibold">
                        <div className="choice-infos d-flex flex-column">
                            <div className="d-flex flex-row align-items-center justify-content-start mb-0">
                                <div className="circular-progressbar-wrapper w-50px">
                                    <CircularProgressBar
                                        value={currentValue}
                                        minValue={0}
                                        maxValue={boxTypeProps.capacity}
                                        showText={true}
                                    />
                                </div>
                            </div>
                        </div>
                        <Menu />
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default BoxTypeDetails;
