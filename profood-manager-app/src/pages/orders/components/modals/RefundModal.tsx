import React, { useState } from 'react';
import {
    Button,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { formatNumber } from '../../../../helpers/AssetHelpers';
import { OrderProps } from '../../../../types';
import { useDataContext } from '../../../../components/contexts/DataProvider';
import { useLoadingSpinnerContext } from '../../../../components/contexts/LoadingSpinnerProvider';

interface RefundModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    order: OrderProps;
}

/**
 * Records a refund on an order. The app never moves funds — it only stores the
 * refund for traceability. The amount is capped at what is still refundable.
 */
const RefundModal: React.FC<RefundModalProps> = ({ order, show, setShow, toggle }) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const { fetchOrders } = useDataContext();
    const { setShowSpinner } = useLoadingSpinnerContext();

    const alreadyRefunded = (order.refunds ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
    const remaining = Math.max(0, Number(order.montant) - alreadyRefunded);

    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('');

    const submit = () => {
        const value = parseInt(amount, 10);
        if (!value || value <= 0) {
            showToast(`${t('Veuillez saisir un montant valide')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        if (value > remaining) {
            showToast(`${t('Le montant du remboursement dépasse le montant remboursable')} !`, 'warning', { autoClose: 2500 });
            return;
        }

        setShowSpinner(true);
        api.post('/add-refund', {
            order_id: order.id,
            amount: value,
            reason: reason.trim() || null,
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((res) => {
                setShow(false);
                showToast(res.data?.message ? t(res.data.message) : t('Remboursement enregistré'), 'success', { autoClose: 2000 });
                fetchOrders(true, 2200);
            })
            .catch((error) => {
                setShowSpinner(false);
                showToast(error.response?.data?.message ? t(error.response.data.message) : t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
            });
    };

    return (
        <Modal isOpen={show} toggle={toggle} centered>
            <ModalHeader toggle={() => setShow(false)}>{t('Enregistrer un remboursement')}</ModalHeader>
            <ModalBody>
                <div className="fs-8 text-muted mb-3">
                    {t('Montant remboursable')} : <span className="fw-semibold">{formatNumber(remaining)} Fcfa</span>
                </div>
                <Form onSubmit={(e) => { e.preventDefault(); submit(); }}>
                    <FormGroup>
                        <Label className="fs-8">{t('Montant')}</Label>
                        <InputGroup>
                            <Input type="number" min={1} max={remaining} value={amount}
                                onInput={(e: React.FormEvent<HTMLInputElement>) => setAmount(e.currentTarget.value)} />
                            <InputGroupText>Fcfa</InputGroupText>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label className="fs-8">{t('Motif')}</Label>
                        <Input type="textarea" rows={2} value={reason}
                            placeholder={t('Optionnel')}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => setReason(e.currentTarget.value)} />
                    </FormGroup>
                </Form>
                <div className="fs-9 text-muted mt-2">
                    {t("L'application enregistre le remboursement ; le versement réel se fait dans votre outil de paiement.")}
                </div>
            </ModalBody>
            <ModalFooter className="border-0">
                <Button color="secondary" size="sm" className="border-0 rounded-1" onClick={() => setShow(false)}>
                    {t('Annuler')}
                </Button>
                <Button color="success" size="sm" className="border-0 rounded-1" onClick={submit} disabled={remaining <= 0}>
                    {t('Enregistrer')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default RefundModal;
