import React, { useState } from "react";

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Form,
    Row
} from "reactstrap";

import { InfoCircleFill } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import { CustomerProps } from "../../../types";
import CustomerAccountActivationToggleModal from "./modals/CustomerAccountActivationToggleModal";

import './CustomerAccountActivationToggleFormView.css';

/**
 * 
 * @param customer 
 * @returns 
 */
const CustomerAccountActivationToggleFormView: React.FC<CustomerProps> = (customer: CustomerProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [customerToActiveOrDeactivate, setCustomerToActiveOrDeactivate] = useState<CustomerProps|null>(null);
    const [showCustomerAccountActivationToggleModal, setShowCustomerAccountActivationToggleModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleCustomerAccountActivationModal = () => setShowCustomerAccountActivationToggleModal(!showCustomerAccountActivationToggleModal);

    /**
     * 
     * @returns 
     */
    const onClosedCustomerAccountActivationToggleModal = () => setCustomerToActiveOrDeactivate(null);

    /**
     * 
     */
    return (
        <Card
            id="customerAccountActivationToggleFormView"
            className="border-0"
        >
            <CardHeader className="py-5 px-6">
                <div className="d-flex flex-row flex-wrap flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-5 mb-0"
                    >
                        <span>{t(`${!customer.user.active ? 'Activer' : 'Désactiver'} le compte`)}</span>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardBody className="py-12 px-6 px-sm-7">
                <Form>
                    <Row className='gx-4 gy-5 align-items-center'>
                        {/* begin::Notice */}
                        <Col xs={12}>

                            <div className="notice notice-warning d-flex align-items-center p-5">
                                <div className="notice-icon-wrapper">
                                    <InfoCircleFill size={24} />
                                </div>
                                <div>
                                    <p className="fs-8 fw-medium mb-0">{t('Pour des raisons de sécurité, cela nécessite que vous confirmez votre mot de passe')}.</p>
                                </div>
                            </div>
                        </Col>
                        {/* end::Notice */}
                    </Row>
                </Form>
            </CardBody>
            <CardFooter className="">
                <div className='d-flex flex-row align-items-center justify-content-end gap-2 py-3 pb-2'>
                    <Button
                        tag='button'
                        type='submit'
                        form='customerAccountDeactivationFormView'
                        color={!customer.user.active ? 'success' : 'danger'}
                        className='border-0'
                        onClick={() => {
                            setCustomerToActiveOrDeactivate(customer);
                            // setTimeout(() => setShowCustomerAccountActivationToggleModal(true), 0);
                            setShowCustomerAccountActivationToggleModal(true);
                        }}
                    >
                        <span>{t(`${!customer.user.active ? 'Activer' : 'Désactiver'} le compte`)}</span>
                    </Button>
                </div>
            </CardFooter>
            {/* begin::Modals */}
            {
                customerToActiveOrDeactivate &&
                <CustomerAccountActivationToggleModal
                    show={showCustomerAccountActivationToggleModal}
                    setShow={setShowCustomerAccountActivationToggleModal}
                    toggle={toggleCustomerAccountActivationModal}
                    onClosed={onClosedCustomerAccountActivationToggleModal}
                    customer={customerToActiveOrDeactivate}
                    active={!customer.user.active}
                />
            }
            {/* end::Modals */}
        </Card>
    );
};

export default CustomerAccountActivationToggleFormView;
