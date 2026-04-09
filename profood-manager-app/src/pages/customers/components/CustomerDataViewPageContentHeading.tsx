import React from "react";

import {
    Card,
    CardBody
} from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCartShopping,
    faEnvelope,
    faMobileAndroid,
    faUser
} from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import { CustomerProps } from "../../../types";
import { formatPhoneNumber, toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";
import { useThemeModeContext } from "../../../components/contexts/ThemeModeProvider";

import './CustomerDataViewPageContentHeading.css';
import { useDataContext } from "../../../components/contexts/DataProvider";

/**
 * 
 * @param customer 
 * @returns 
 */
const CustomerDataViewPageContentHeading: React.FC<CustomerProps> = (customer: CustomerProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    const { orders } = useDataContext();

    /**
     * 
     */
    return (
        <Card
            id="customerDataViewPageContentHeading"
            className="border-0"
        >
            <CardBody className="pt-8 px-8">
                <div className="d-flex flex-wrap flex-sm-nowrap">
                    {/* begin::Avatar */}
                    <div className="me-7 mb-4">
                        <div className="w-100px w-lg-160px rounded position-relative">
                            <img
                                className='avatar img-fluid rounded'
                                src={(customer.user.avatar) ? customer.user.avatar : toAbsolutePublicUrl(`/assets/media/images/icons/svg/avatar-${themeMode === 'dark' ? 'dark' : 'light'}.svg`)}
                                alt="Avatar"
                            />
                            <div className={`position-absolute translate-middle bottom-0 start-100 mb-6 ${customer.user.logged ? 'bg-success' : 'bg-danger'} rounded-circle border-card-bg border-4 border h-20px w-20px`}></div>
                        </div>
                    </div>
                    {/* end::Avatar */}
                    {/* begin::Info */}
                    <div className="flex-grow-1">
                        {/* begin::Title */}
                        <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                            {/* begin::Customer */}
                            <div className="d-flex flex-column">
                                {/* begin::Name */}
                                <div className="d-flex align-items-center mb-2">
                                    <div className="title-color fs-5 fw-semibold me-1">{`${customer.user.first_name} ${customer.user.last_name}`}</div>
                                </div>
                                {/* end::Name */}
                                {/* begin::Info details */}
                                <div className="d-flex flex-wrap fw-medium fs-8 mb-4 pe-2">
                                    <div className="d-flex align-items-center text-muted me-5 mb-2">
                                        <span className="icon-wrapper me-1">
                                            <FontAwesomeIcon icon={faMobileAndroid} />
                                        </span>
                                        <span>{formatPhoneNumber(customer.user.phone_number)}</span>
                                    </div>
                                    <div className="d-flex align-items-center text-muted me-5 mb-2">
                                        <span className="icon-wrapper me-1">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </span>
                                        <span>{customer.user.email}</span>
                                    </div>
                                </div>
                                {/* end::Info details*/}
                            </div>
                            {/* end::Customer */}
                        </div>
                        {/* end::Title */}
                        {/* begin::Wrapper */}
                        <div className="d-flex flex-column flex-grow-1 pe-8">
                            {/* begin::Stats */}
                            <div className="d-flex flex-wrap">

                                {/* begin::Stat */}
                                <div className="border border-gray-400 border-dashed rounded w-175px py-2 px-4 me-6 mb-3">
                                    {/* begin::Number */}
                                    <div className="d-flex align-items-center">
                                        <span className="icon-wrapper me-2 text-success">
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                        <div className="title-color fs-6 fw-semibold counted">{customer.user.session_count}</div>
                                    </div>
                                    {/* end::Number */}

                                    {/* begin::Label */}
                                    <div className="fw-medium fs-8 text-muted">{t('Nombre de sessions')}</div>
                                    {/* end::Label */}
                                </div>
                                {/* end::Stat */}
                                {/* begin::Stat */}
                                <div className="border border-gray-400 border-dashed rounded w-175px py-2 px-4 me-6 mb-3">
                                    {/* begin::Number */}
                                    <div className="d-flex align-items-center">
                                        <span className="icon-wrapper me-2 text-info">
                                            <FontAwesomeIcon icon={faCartShopping} />
                                        </span>
                                        <div className="title-color fs-6 fw-semibold counted">{orders.filter((o) => o.customer?.id === customer.id).length}</div>
                                    </div>
                                    {/* end::Number */}

                                    {/* begin::Label */}
                                    <div className="fw-medium fs-8 text-muted">{t('Commandes passées')}</div>
                                    {/* end::Label */}
                                </div>
                                {/* end::Stat */}
                            </div>
                            {/* end::Stats */}
                        </div>
                        {/* end::Wrapper */}
                    </div>
                    {/* end::Info */}
                </div>
            </CardBody>
        </Card>
    );
};

export default CustomerDataViewPageContentHeading;
