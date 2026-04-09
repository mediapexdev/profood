import React, { useState } from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Progress
} from 'reactstrap';
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
import { useTranslation } from 'react-i18next';
import { OrderProps, OrderStatus } from '../../../../types';
import { useDataContext } from '../../../../components/contexts/DataProvider';
import { useUserInfosContext } from '../../../account/components/contexts/UserInfosProvider';
import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';

interface BulkStatusUpdateModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    orders: OrderProps[];
    onComplete: () => void;
}

/**
 * Modal for updating the status of multiple orders in sequence.
 *
 * Orders are processed one at a time (sequential async loop) rather than in
 * parallel to avoid overwhelming the API and to allow accurate progress
 * tracking. Orders whose current status code is >= the target code are skipped
 * and counted as errors since the API enforces a forward-only workflow.
 *
 * The modal is non-dismissable while processing (backdrop="static" and the
 * cancel button is disabled) to prevent partial updates from being abandoned.
 */
const BulkStatusUpdateModal: React.FC<BulkStatusUpdateModalProps> = ({
    show,
    setShow,
    toggle,
    orders,
    onComplete
}) => {
    const { t } = useTranslation();
    const { orderStatuses, fetchOrders } = useDataContext();
    const { userPhoneNumber } = useUserInfosContext();
    const showToast = useToast();

    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);

    // Exclude cancelled (code 80) from bulk targets — cancellation should be
    // a deliberate per-order action with its own confirmation flow.
    const availableStatuses = orderStatuses.filter(s => s.code !== 80);

    const handleBulkUpdate = async () => {
        if (!selectedStatus) {
            showToast(t('Veuillez remplir ce champ'), 'warning', { autoClose: 2000 });
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setSuccessCount(0);
        setErrorCount(0);

        const token = localStorage.getItem('token');
        let successes = 0;
        let errors = 0;

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            // Skip orders that are already at or past the target status.
            // The API would reject these anyway, but skipping them locally
            // avoids unnecessary network requests and keeps the error count
            // meaningful (true failures vs. invalid selections).
            if (selectedStatus.code <= order.status.code) {
                errors++;
                setErrorCount(errors);
                setProgress(Math.round(((i + 1) / orders.length) * 100));
                continue;
            }

            try {
                const res = await api.post(
                    '/update-order-status',
                    {
                        order_id: order.id,
                        status_id: selectedStatus.id,
                        manager_phone_number: userPhoneNumber
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (res.status === 200) {
                    successes++;
                    setSuccessCount(successes);
                } else {
                    errors++;
                    setErrorCount(errors);
                }
            } catch {
                errors++;
                setErrorCount(errors);
            }

            setProgress(Math.round(((i + 1) / orders.length) * 100));
        }

        setIsProcessing(false);

        if (successes > 0) {
            showToast(
                `${successes} ${t('commandes mises à jour')}${errors > 0 ? `, ${errors} ${t('erreur(s)')}` : ''}`,
                errors > 0 ? 'warning' : 'success',
                { autoClose: 3000 }
            );
            fetchOrders(true, 3200);
        } else if (errors > 0) {
            showToast(
                `${errors} ${t('erreur(s)')}`,
                'error',
                { autoClose: 3000 }
            );
        }

        setShow(false);
        onComplete();
    };

    const resetAndClose = () => {
        setSelectedStatus(null);
        setProgress(0);
        setSuccessCount(0);
        setErrorCount(0);
        setIsProcessing(false);
        setShow(false);
    };

    return (
        <Modal
            isOpen={show}
            // Prevent accidental dismissal while a batch is in flight
            toggle={isProcessing ? undefined : toggle}
            size="md"
            backdrop="static"
            centered
        >
            <ModalHeader className="flex-center">
                {t('Mise à jour du statut')}
            </ModalHeader>
            <ModalBody>
                <div className="mb-3">
                    <p className="fs-7 text-muted">
                        {orders.length} {t('Sélectionnés').toLowerCase()}
                    </p>
                </div>
                <Select
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
                    isSearchable={false}
                    isDisabled={isProcessing}
                    menuPlacement="auto"
                    menuPortalTarget={document.body}
                    name="status"
                    options={availableStatuses}
                    getOptionLabel={(option) => t(option.wording)}
                    getOptionValue={(option) => String(option.id)}
                    placeholder={t('Statut')}
                    styles={customSelectStyles}
                    onChange={(value) => setSelectedStatus(value as OrderStatus | null)}
                />

                {/* Progress indicator shown only while the batch is running */}
                {isProcessing && (
                    <div className="mt-4">
                        <Progress value={progress} className="mb-2" />
                        <div className="d-flex justify-content-between fs-8 text-muted">
                            <span>{successCount} {t('commandes mises à jour')}</span>
                            {errorCount > 0 && (
                                <span className="text-danger">{errorCount} {t('erreur(s)')}</span>
                            )}
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalFooter className="border-0">
                <div className="d-flex flex-row flex-center gap-2">
                    <Button
                        color="secondary"
                        size="sm"
                        className="border-0 rounded-1 w-110px"
                        onClick={resetAndClose}
                        disabled={isProcessing}
                    >
                        <span>{t('Annuler')}</span>
                    </Button>
                    <Button
                        color="success"
                        size="sm"
                        className="border-0 rounded-1 w-110px"
                        onClick={handleBulkUpdate}
                        disabled={isProcessing || !selectedStatus}
                    >
                        <span>{isProcessing ? t('Veuillez patienter') : t('Confirmer')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default BulkStatusUpdateModal;
