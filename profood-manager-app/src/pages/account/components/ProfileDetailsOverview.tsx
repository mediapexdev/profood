import React from "react";

import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Row
} from "reactstrap";

import { useTranslation } from "react-i18next";

import { formatPhoneNumber } from "../../../helpers/AssetHelpers";
import { useUserInfosContext } from "./contexts/UserInfosProvider";

import './ProfileDetailsOverview.css';

/**
 * 
 * @returns 
 */
const ProfileDetailsOverview: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        userFirstName,
        userLastName,
        userPhoneNumber,
        userEmail,
        userRole,
    } = useUserInfosContext();

    /**
     * 
     */
    const data = [
        {
            wording: t('Prénom et nom'),
            value: `${userFirstName} ${userLastName}`
        },
        {
            wording: t('Numéro de téléphone'),
            value: formatPhoneNumber(userPhoneNumber)
        },
        {
            wording: t('Adresse e-mail'),
            value: userEmail
        },
        {
            wording: 'Role',
            value: t(userRole?.wording as string)
        }
    ];

    /**
     * 
     */
    return (
        <Card
            id="profileDetailsOverview"
            className="border-0"
        >
            <CardHeader className="title-color py-4 px-6">
                <div className="d-flex flex-row flex-wrap flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-6 mb-0"
                    >
                        <span>{t('Détails du profil')}</span>
                    </CardTitle>
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

export default ProfileDetailsOverview;
