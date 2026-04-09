import React, { useState } from "react";

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle
} from "reactstrap";

import { useTranslation } from "react-i18next";

import PasswordEditModal from "./modals/PasswordEditModal";
import PhoneNumberEditModal from "./modals/PhoneNumberEditModal";
import { formatPhoneNumber } from "../../../helpers/AssetHelpers";
import { useUserInfosContext } from "./contexts/UserInfosProvider";

import './SignInMethodEditingView.css';

/**
 * 
 * @returns 
 */
const SignInMethodEditingView: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        userPhoneNumber
    } = useUserInfosContext();

    /**
     * 
     */
    const [showPhoneNumberEditModal, setShowPhoneNumberEditModal] = useState<boolean>(false);
    const togglePhoneNumberEditModal = () => setShowPhoneNumberEditModal(!showPhoneNumberEditModal);

    /**
     * 
     */
    const [showPasswordEditModal, setShowPasswordEditModal] = useState<boolean>(false);
    const togglePasswordEditModal = () => setShowPasswordEditModal(!showPasswordEditModal);

    /**
     * 
     */
    return (
        <Card
            id="signInMethodEditingView"
            className="border-0"
        >
            <CardHeader className="py-5 px-6">
                <div className="d-flex flex-row flex-wrap flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-5 mb-0"
                    >
                        <span>{t('Méthode de connexion')}</span>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardBody
                className="py-8 px-6"
            >
                {/* begin::Phone number */}
                <div className="d-flex flex-wrap align-items-center mb-10">
                    {/* begin::Label */}
                    <div className="">
                        <div className="fs-7 fw-medium mb-1">{t('Numéro de téléphone')}</div>
                        <div className="fw-semibold text-gray-600">{formatPhoneNumber(userPhoneNumber)}</div>
                    </div>
                    {/* end::Label */}
                    {/* begin::Action */}
                    <div className="ms-auto">
                        <Button
                            tag='button'
                            type='button'
                            className="btn btn-light fs-7"
                            onClick={() => setShowPhoneNumberEditModal(true)}
                        >
                            <span>{t('Changer le numéro de téléphone')}</span>
                        </Button>
                    </div>
                    {/* end::Action */}
                </div>
                {/* end::Phone number */}
                {/* begin::Password */}
                <div className="d-flex flex-wrap align-items-center mb-10">
                    {/* begin::Label */}
                    <div className="">
                        <div className="fs-7 fw-medium mb-1">{t('Mot de passe')}</div>
                        <div className="fw-semibold text-gray-600">************</div>
                    </div>
                    {/* end::Label */}
                    {/* begin::Action */}
                    <div className="ms-auto">
                        <Button
                            tag='button'
                            type='button'
                            className="btn btn-light fs-7"
                            onClick={() => setShowPasswordEditModal(true)}
                        >
                            <span>{t('Réinitialiser le mot de passe')}</span>
                        </Button>
                    </div>
                    {/* end::Action */}
                </div>
                {/* end::Password */}
                {/* begin::Modals */}
                <PasswordEditModal
                    show={showPasswordEditModal}
                    setShow={setShowPasswordEditModal}
                    toggle={togglePasswordEditModal}
                />
                <PhoneNumberEditModal
                    show={showPhoneNumberEditModal}
                    setShow={setShowPhoneNumberEditModal}
                    toggle={togglePhoneNumberEditModal}
                />
                {/* end::Modals */}
            </CardBody>
        </Card>
    );
};

export default SignInMethodEditingView;
