import React, { useEffect, useRef, useState } from "react";

import {
    Button,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";

import Select from 'react-select';

import {
    customSelectClearIndicator,
    customSelectControl,
    customSelectDropdownIndicator,
    customSelectMenu,
    customSelectMenuList,
    customSelectOption,
    customSelectPlaceholder,
    customSelectStyles,
    customSelectValueConatiner
} from '../../../../components/others/select-customizer';

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useToast from "../../../../components/hooks/useToast";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { OrderProps, OrderStatus } from "../../../../types";
import { useUserInfosContext } from "../../../account/components/contexts/UserInfosProvider";

import './OrderStatusUpdateModal.css';

/**
 * 
 */
export interface OrderStatusUpdateModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    onClosed: () => void;
    order: OrderProps;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const OrderStatusUpdateModal: React.FC<OrderStatusUpdateModalProps> = ({order, show, setShow, toggle, onClosed}: OrderStatusUpdateModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { orderStatuses, fetchOrders } = useDataContext();

    /**
     * 
     */
    const [status, setStatus] = useState<OrderStatus|undefined>(undefined);

    /**
     * 
     */
    const [isValidStatus, setIsValidStatus] = useState<boolean>(false);
    const [isTouchedForStatus, setIsTouchedForStatus] = useState<boolean>(false);

    /**
     * 
     */
    const statusesSelectRef = useRef<any>(null);

    /**
     * 
     * @param _status 
     */
    const changeStatus = (_status?: OrderStatus) => {
        setStatus(_status);
        setIsValidStatus(_status !== undefined && _status !== null);
    };

    /**
     * 
     */
    useEffect(() => {

        setTimeout(() => {
            changeStatus(order.status);

            if(statusesSelectRef.current !== undefined && statusesSelectRef.current !== null){
                statusesSelectRef.current.setValue(order.status);
            }
        }, 0)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const { userPhoneNumber } = useUserInfosContext();

    /**
     * 
     */
    const updateOrderStatus = () => {

        if(!isValidStatus) {
            setIsTouchedForStatus(true);
            showToast(t('Veuillez sélectionner un statut'), 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "order_id": order.id,
            "status_id": status?.id,
            "manager_phone_number": userPhoneNumber
        };
        api.post('/update-order-status', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                setShow(false);
                fetchOrders(true, 3200);
                showToast(t(res.data.message), 'success', {autoClose: 2000});
            }
            else{
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            console.dir(error);
        });
    };

    /**
     * 
     */
    return (
        <Modal
            id='orderStatusUpdateModal'
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            size='md'
            backdrop='static'
            centered={true}
        >
            <ModalHeader className='flex-center border-0 py-5 px-sm-4'>
                <span className="fs-6">{t('Mise à jour du statut')}</span>
            </ModalHeader>
            <ModalBody className='px-sm-4'>
                <Form>
                    <div className="d-flex flex-column">
                        {/*  */}
                        <Row className="align-items-center">
                            <Col xs={12}>
                                <div className={`form-group-wrapper mb-1 ${!isValidStatus && isTouchedForStatus ? 'is-invalid' : ''}`}>
                                    <FormGroup className='form-group mb-0'>
                                        <Select
                                            ref={statusesSelectRef}
                                            components={{
                                                Control: customSelectControl,
                                                ClearIndicator: customSelectClearIndicator,
                                                DropdownIndicator: customSelectDropdownIndicator,
                                                Menu: customSelectMenu,
                                                MenuList: customSelectMenuList,
                                                Option: customSelectOption,
                                                Placeholder: customSelectPlaceholder,
                                                ValueContainer: customSelectValueConatiner
                                            }}
                                            isClearable={true}
                                            isSearchable={true}
                                            menuPlacement='auto'
                                            menuPortalTarget={document.body}
                                            name='status'
                                            options={orderStatuses}
                                            getOptionLabel={(option) => t(option.wording)}
                                            getOptionValue={(option) => option.id}
                                            placeholder={t('Statut')}
                                            styles={customSelectStyles}
                                            onChange={changeStatus}
                                            onBlur={() => setIsTouchedForStatus(true)}
                                            className={`${!isValidStatus && isTouchedForStatus ? 'is-invalid' : ''}`}
                                        />
                                    </FormGroup>
                                    <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                                </div>
                            </Col>
                        </Row>
                        {/*  */}
                    </div>
                </Form>
            </ModalBody>
            <ModalFooter className='border-0'>
                <div className='d-flex flex-row flex-center gap-2'>
                    <Button
                        tag='button'
                        type='button'
                        color='secondary'
                        size='sm'
                        className='border-0 rounded-1 w-110px'
                        onClick={() => {
                            setShow(false);
                        }}
                    >
                        <span>{t('Annuler')}</span>
                    </Button>
                    <Button
                        tag='button'
                        type='button'
                        color='danger'
                        size='sm'
                        className='border-0 rounded-1 w-110px'
                        onClick={updateOrderStatus}
                    >
                        <span>{t('Confirmer')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default OrderStatusUpdateModal;
