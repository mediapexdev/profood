import React, { useEffect, useState } from 'react';
import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { OrderProps } from '../../../../types';
import { useDataContext } from '../../../../components/contexts/DataProvider';
import { useLoadingSpinnerContext } from '../../../../components/contexts/LoadingSpinnerProvider';

interface OrderEditModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    order: OrderProps;
}

interface LocaliteOption {
    id: number;
    wording: string;
}

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

/**
 * Edits an order's delivery/contact details (not its items). Changing the
 * locality re-resolves the delivery zone fee and recomputes the total
 * server-side.
 */
const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, show, setShow, toggle }) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const { fetchOrders } = useDataContext();
    const { setShowSpinner } = useLoadingSpinnerContext();

    const [address, setAddress] = useState<string>(order.address ?? '');
    const [paymentMethod, setPaymentMethod] = useState<string>(order.payment_method ?? '');
    const [firstName, setFirstName] = useState<string>(order.guest_first_name ?? '');
    const [lastName, setLastName] = useState<string>(order.guest_last_name ?? '');
    const [phone, setPhone] = useState<string>(order.guest_phone_number ?? '');
    const [email, setEmail] = useState<string>(order.guest_email ?? '');

    const [localites, setLocalites] = useState<LocaliteOption[]>([]);
    const [localite, setLocalite] = useState<LocaliteOption | null>(null);

    // Load the localities once so the delivery zone can be corrected.
    useEffect(() => {
        if (!show) {
            return;
        }
        api.get('/get-localites', authHeaders())
            .then((res) => {
                const rows: LocaliteOption[] = Array.isArray(res.data)
                    ? res.data
                    : (res.data?.data ?? res.data?.localites ?? []);
                setLocalites(rows);
                if (order.localite_id != null) {
                    setLocalite(rows.find((l) => l.id === order.localite_id) ?? null);
                }
            })
            .catch(() => { /* address stays editable even if localities fail to load */ });
    }, [show, order.localite_id]);

    const submit = () => {
        if (!address.trim()) {
            showToast(`${t("Veuillez renseigner l'adresse de livraison")} !`, 'warning', { autoClose: 2000 });
            return;
        }

        setShowSpinner(true);
        const payload: any = {
            order_id: order.id,
            address: address.trim(),
            payment_method: paymentMethod.trim() || null,
            localite_id: localite ? localite.id : null,
        };
        if (order.is_guest_order) {
            payload.guest_first_name = firstName.trim() || null;
            payload.guest_last_name = lastName.trim() || null;
            payload.guest_phone_number = phone.trim() || null;
            payload.guest_email = email.trim() || null;
        }

        api.post('/update-order-details', payload, authHeaders())
            .then((res) => {
                setShow(false);
                showToast(res.data?.message ? t(res.data.message) : t('Commande mise à jour'), 'success', { autoClose: 2000 });
                fetchOrders(true, 2200);
            })
            .catch((error) => {
                setShowSpinner(false);
                showToast(error.response?.data?.message ? t(error.response.data.message) : t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error');
            });
    };

    return (
        <Modal isOpen={show} toggle={toggle} centered size="lg">
            <ModalHeader toggle={() => setShow(false)}>{t('Modifier la commande')}</ModalHeader>
            <ModalBody>
                <Form onSubmit={(e) => { e.preventDefault(); submit(); }}>
                    <FormGroup>
                        <Label className="fs-8">{t('Adresse de livraison')}</Label>
                        <Input type="text" value={address} maxLength={255}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => setAddress(e.currentTarget.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label className="fs-8">{t('Localité')}</Label>
                        <Select
                            isClearable
                            isSearchable
                            options={localites}
                            value={localite}
                            getOptionLabel={(o) => o.wording}
                            getOptionValue={(o) => String(o.id)}
                            placeholder={t('Rechercher votre localité')}
                            onChange={(o) => setLocalite(o as LocaliteOption | null)}
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        />
                        <div className="fs-9 text-muted mt-1">{t('Change la zone de livraison et recalcule le total.')}</div>
                    </FormGroup>
                    <FormGroup>
                        <Label className="fs-8">{t('Mode de paiement')}</Label>
                        <Input type="text" value={paymentMethod} maxLength={255}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => setPaymentMethod(e.currentTarget.value)} />
                    </FormGroup>
                    {order.is_guest_order && (
                        <>
                            <FormGroup>
                                <Label className="fs-8">{t('Prénom')}</Label>
                                <Input type="text" value={firstName}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => setFirstName(e.currentTarget.value)} />
                            </FormGroup>
                            <FormGroup>
                                <Label className="fs-8">{t('Nom')}</Label>
                                <Input type="text" value={lastName}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => setLastName(e.currentTarget.value)} />
                            </FormGroup>
                            <FormGroup>
                                <Label className="fs-8">{t('Téléphone')}</Label>
                                <Input type="text" value={phone}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => setPhone(e.currentTarget.value)} />
                            </FormGroup>
                            <FormGroup>
                                <Label className="fs-8">{t('E-mail')}</Label>
                                <Input type="email" value={email}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)} />
                            </FormGroup>
                        </>
                    )}
                </Form>
            </ModalBody>
            <ModalFooter className="border-0">
                <Button color="secondary" size="sm" className="border-0 rounded-1" onClick={() => setShow(false)}>
                    {t('Annuler')}
                </Button>
                <Button color="success" size="sm" className="border-0 rounded-1" onClick={submit}>
                    {t('Enregistrer')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default OrderEditModal;
