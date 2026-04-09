import React from "react";

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Row
} from "reactstrap";

import { useTranslation } from "react-i18next";

import { CustomerProps } from "../../../types";
import { formatPhoneNumber } from "../../../helpers/AssetHelpers";
import useGoTo from "../../../components/hooks/useGoTo";

import './CustomerProfileDetailsOverview.css';

/**
 * 
 * @param customer 
 * @returns 
 */
const CustomerProfileDetailsOverview: React.FC<CustomerProps> = (customer: CustomerProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const data = [
        {
            wording: t('Prénom et nom'),
            value: `${customer.user.first_name} ${customer.user.last_name}`
        },
        {
            wording: t('Numéro de téléphone'),
            value: formatPhoneNumber(customer.user.phone_number)
        },
        {
            wording: t('Adresse e-mail'),
            value: customer.user.email
        },
        {
            wording: t('Actif'),
            value: `${customer.user.active ? 'Oui' : 'Non'}`
        }
    ];

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    return (
        <Card
            id="customerProfileDetailsOverview"
            className="border-0"
        >
            <CardHeader className="title-color bg-transparent py-5 px-6">
                <div className="d-flex flex-row flex-wrap flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-6 mb-0"
                    >
                        <span>{t('Détails du profil')}</span>
                    </CardTitle>
                    <div>
                        <Button
                            tag='button'
                            type='button'
                            color='light'
                            onClick={() => goTo(`/clients/edition/${customer.id}`)}
                        >
                            <span>{t('Editer')}</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardBody
                className="py-8 px-6"
            >
            {
                data.map((element, key) => {
                    return (
                        <Row
                            key={key}
                            className="mb-7"
                        >
                            <Col lg={4}>
                                <div className="fw-medium fs-8 text-muted">
                                    <span>{element.wording}</span>
                                </div>
                            </Col>
                            <Col lg={8}>
                                <div className="fw-semibold fs-8 content-color">
                                    <span>{element.value}</span>
                                </div>
                            </Col>
                        </Row>
                    );
                })
            }
            </CardBody>
        </Card>
    );
};

export default CustomerProfileDetailsOverview;
