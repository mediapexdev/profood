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

import { UserProps } from "../../../../types";
import UserAccountActivationToggleModal from "./modals/UserAccountActivationToggleModal";

import './UserAccountActivationToggleFormView.css';

/**
 * 
 * @param user 
 * @returns 
 */
const UserAccountActivationToggleFormView: React.FC<UserProps> = (user: UserProps) => {
    /**
     * 
     */
    const [userToActiveOrDeactivate, setUserToActiveOrDeactivate] = useState<UserProps|null>(null);
    const [showUserAccountActivationToggleModal, setShowUserAccountActivationToggleModal] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleUserAccountActivationModal = () => setShowUserAccountActivationToggleModal(!showUserAccountActivationToggleModal);

    /**
     * 
     * @returns 
     */
    const onClosedUserAccountActivationToggleModal = () => setUserToActiveOrDeactivate(null);

    /**
     * 
     */
    return (
        <Card
            id="userAccountActivationToggleFormView"
            className="border-0"
        >
            <CardHeader className="py-5 px-6">
                <div className="d-flex flex-row flex-wrap flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-5 mb-0"
                    >
                        <span>{`${!user.active ? 'Activer' : 'Désactiver'} le compte`}</span>
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
                                    <p className="fs-8 fw-medium mb-0">Pour des raisons de sécurité, cela nécessite que vous confirmez votre mot de passe.</p>
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
                        form='userAccountDeactivationFormView'
                        color={!user.active ? 'success' : 'danger'}
                        className='border-0'
                        onClick={() => {
                            setUserToActiveOrDeactivate(user);
                            // setTimeout(() => setShowUserAccountActivationToggleModal(true), 0);
                            setShowUserAccountActivationToggleModal(true);
                        }}
                    >
                        <span>{`${!user.active ? 'Activer' : 'Désactiver'} le compte`}</span>
                    </Button>
                </div>
            </CardFooter>
            {/* begin::Modals */}
            {
                userToActiveOrDeactivate &&
                <UserAccountActivationToggleModal
                    show={showUserAccountActivationToggleModal}
                    setShow={setShowUserAccountActivationToggleModal}
                    toggle={toggleUserAccountActivationModal}
                    onClosed={onClosedUserAccountActivationToggleModal}
                    user={userToActiveOrDeactivate}
                    active={!user.active}
                />
            }
            {/* end::Modals */}
        </Card>
    );
};

export default UserAccountActivationToggleFormView;
