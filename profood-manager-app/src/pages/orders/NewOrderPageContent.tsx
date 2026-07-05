import React, { useMemo, useState } from 'react';

import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Row,
    Table
} from 'reactstrap';

import Select from 'react-select';

import { useTranslation } from 'react-i18next';

import api from '../../api/api';
import useToast from '../../components/hooks/useToast';
import useGoTo from '../../components/hooks/useGoTo';
import { useDataContext } from '../../components/contexts/DataProvider';
import { useLoadingSpinnerContext } from '../../components/contexts/LoadingSpinnerProvider';
import { formatNumber } from '../../helpers/AssetHelpers';

import './NewOrderPageContent.css';

type Mode = 'guest' | 'customer';

/**
 * Staff order builder (phone / walk-in). Builds a cart_items payload and POSTs
 * to the authenticated, staff-gated /add-manual-order endpoint. The total is
 * display-only — the server recomputes it authoritatively.
 */
const NewOrderPageContent: React.FC = () => {
    const { t } = useTranslation();
    const goTo = useGoTo();
    const showToast = useToast();
    const { setShowSpinner } = useLoadingSpinnerContext();
    const { customers, slices, boxTypes, fetchOrders } = useDataContext();

    const [mode, setMode] = useState<Mode>('guest');
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [guestFirstName, setGuestFirstName] = useState('');
    const [guestLastName, setGuestLastName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('À la livraison');
    const [markPaid, setMarkPaid] = useState(false);
    const [notifyCustomer, setNotifyCustomer] = useState(false);
    const [pending, setPending] = useState(false);

    const [boxQty, setBoxQty] = useState<Record<number, number>>({});
    const [sliceQty, setSliceQty] = useState<Record<number, number>>({});

    const setBox = (id: number, qty: number) => setBoxQty((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
    const setSlice = (id: number, qty: number) => setSliceQty((prev) => ({ ...prev, [id]: Math.max(0, qty) }));

    const customerOptions = customers.map((c) => ({
        value: c.id,
        label: `${c.user?.first_name ?? ''} ${c.user?.last_name ?? ''} — ${c.user?.phone_number ?? ''}`.trim(),
    }));

    const estimatedTotal = useMemo(() => {
        let total = 0;
        boxTypes.forEach((b) => { total += (boxQty[b.id] ?? 0) * Number(b.price); });
        slices.forEach((s) => { total += (sliceQty[s.id] ?? 0) * Number(s.price); });
        return total;
    }, [boxTypes, slices, boxQty, sliceQty]);

    const buildCartItems = () => {
        const items: Array<Record<string, unknown>> = [];
        boxTypes.forEach((b) => {
            if ((boxQty[b.id] ?? 0) > 0) {
                items.push({ type: 'box', box_type_id: b.id, quantity: boxQty[b.id] });
            }
        });
        slices.forEach((s) => {
            if ((sliceQty[s.id] ?? 0) > 0) {
                items.push({ type: 'slice', slice_id: s.id, quantity: sliceQty[s.id] });
            }
        });
        return items;
    };

    const submit = () => {
        const items = buildCartItems();
        if (items.length === 0) {
            showToast(`${t('Le panier ne peut pas être vide')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        if (!address.trim()) {
            showToast(`${t("L'adresse de livraison est obligatoire")} !`, 'warning', { autoClose: 2000 });
            return;
        }
        if (mode === 'customer' && !customerId) {
            showToast(`${t('Veuillez sélectionner un client')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        if (mode === 'guest' && (!guestFirstName.trim() || !guestLastName.trim() || !guestPhone.trim())) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }

        const payload: Record<string, unknown> = {
            address: address.trim(),
            payment_method: paymentMethod,
            mark_paid: markPaid,
            notify_customer: notifyCustomer,
            cart_items: items,
        };
        if (mode === 'customer') {
            payload.customer_id = customerId;
        } else {
            payload.guest_first_name = guestFirstName.trim();
            payload.guest_last_name = guestLastName.trim();
            payload.guest_phone_number = guestPhone.trim();
            payload.guest_email = guestEmail.trim() || null;
        }

        setPending(true);
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        api.post('/add-manual-order', payload, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                if (res.status === 201 && res.data.order) {
                    showToast(t(res.data.message ?? 'Commande créée'), 'success', { autoClose: 2000 });
                    fetchOrders(true, 2400);
                    goTo(`/commandes/${res.data.order.string_id}`);
                } else {
                    setPending(false);
                    setShowSpinner(false);
                    showToast(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
                }
            })
            .catch((error) => {
                setPending(false);
                setShowSpinner(false);
                showToast(error.response?.data?.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            });
    };

    return (
        <div id="newOrderPageContent" className="page-content position-relative">
            <div className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10">
                <Form onSubmit={(e) => e.preventDefault()}>
                    <Row className="gy-4">
                        {/* Customer */}
                        <Col xs={12} lg={7}>
                            <Card className="border-0 rounded-1 h-100">
                                <CardHeader className="py-4">
                                    <CardTitle tag="h3" className="title-color h6 m-0">{t('Client')}</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <ButtonGroup size="sm" className="mb-4">
                                        <Button color={mode === 'guest' ? 'info2' : 'secondary'} outline={mode !== 'guest'} className="border-0" onClick={() => setMode('guest')}>
                                            {t('Au comptoir')}
                                        </Button>
                                        <Button color={mode === 'customer' ? 'info2' : 'secondary'} outline={mode !== 'customer'} className="border-0" onClick={() => setMode('customer')}>
                                            {t('Client existant')}
                                        </Button>
                                    </ButtonGroup>

                                    {mode === 'customer' ? (
                                        <FormGroup>
                                            <Label className="fs-8">{t('Client')}</Label>
                                            <Select
                                                options={customerOptions}
                                                isClearable
                                                placeholder={t('Rechercher un client')}
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                onChange={(opt) => setCustomerId(opt ? (opt as { value: number }).value : null)}
                                            />
                                        </FormGroup>
                                    ) : (
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <FormGroup floating>
                                                    <Input id="mfn" placeholder={t('Prénom')} value={guestFirstName} onChange={(e) => setGuestFirstName(e.target.value)} />
                                                    <Label for="mfn">{t('Prénom')}</Label>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup floating>
                                                    <Input id="mln" placeholder={t('Nom')} value={guestLastName} onChange={(e) => setGuestLastName(e.target.value)} />
                                                    <Label for="mln">{t('Nom')}</Label>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup floating>
                                                    <Input id="mph" type="tel" placeholder={t('Téléphone')} value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
                                                    <Label for="mph">{t('Téléphone')}</Label>
                                                </FormGroup>
                                            </Col>
                                            <Col md={6}>
                                                <FormGroup floating>
                                                    <Input id="mem" type="email" placeholder={t('Email')} value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                                                    <Label for="mem">{t('Email')}</Label>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    )}

                                    <FormGroup floating className="mt-2 mb-0">
                                        <Input id="madr" placeholder={t('Adresse')} value={address} onChange={(e) => setAddress(e.target.value)} />
                                        <Label for="madr">{t('Adresse')}</Label>
                                    </FormGroup>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Payment + summary */}
                        <Col xs={12} lg={5}>
                            <Card className="border-0 rounded-1 h-100">
                                <CardHeader className="py-4">
                                    <CardTitle tag="h3" className="title-color h6 m-0">{t('Paiement')}</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <FormGroup>
                                        <Label className="fs-8">{t('Mode de paiement')}</Label>
                                        <Input type="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                            <option value="À la livraison">{t('À la livraison')}</option>
                                            <option value="Espèces">{t('Espèces')}</option>
                                            <option value="Mobile money">{t('Mobile money')}</option>
                                        </Input>
                                    </FormGroup>
                                    <FormGroup check className="mb-2">
                                        <Input id="mpaid" type="checkbox" checked={markPaid} onChange={(e) => setMarkPaid(e.target.checked)} />
                                        <Label for="mpaid" check className="fs-8">{t('Paiement déjà encaissé')}</Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Input id="mnotif" type="checkbox" checked={notifyCustomer} onChange={(e) => setNotifyCustomer(e.target.checked)} />
                                        <Label for="mnotif" check className="fs-8">{t('Envoyer un SMS au client')}</Label>
                                    </FormGroup>
                                    <div className="d-flex flex-stack border-top mt-4 pt-3">
                                        <span className="fw-semibold">{t('Total estimé')}</span>
                                        <span className="fw-bold title-color">{formatNumber(estimatedTotal)} Fcfa</span>
                                    </div>
                                    <div className="d-grid mt-4">
                                        <Button color="success" className="border-0 rounded-1" disabled={pending} onClick={submit}>
                                            {t('Créer la commande')}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Products */}
                        <Col xs={12}>
                            <Card className="border-0 rounded-1">
                                <CardHeader className="py-4">
                                    <CardTitle tag="h3" className="title-color h6 m-0">{t('Articles')}</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <Row>
                                        <Col md={6}>
                                            <h6 className="fs-8 text-muted mb-2">{t('Boxes')}</h6>
                                            <Table responsive size="sm" className="mb-4">
                                                <tbody>
                                                    {boxTypes.map((b) => (
                                                        <tr key={b.id}>
                                                            <td className="fs-8">{b.wording}</td>
                                                            <td className="fs-9 text-muted text-nowrap">{formatNumber(b.price)} Fcfa</td>
                                                            <td style={{ width: '90px' }}>
                                                                <Input type="number" min={0} bsSize="sm" value={boxQty[b.id] ?? 0} onChange={(e) => setBox(b.id, Number(e.target.value))} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Col>
                                        <Col md={6}>
                                            <h6 className="fs-8 text-muted mb-2">{t('Au détail')}</h6>
                                            <Table responsive size="sm" className="mb-0">
                                                <tbody>
                                                    {slices.map((s) => (
                                                        <tr key={s.id}>
                                                            <td className="fs-8">{s.wording}</td>
                                                            <td className="fs-9 text-muted text-nowrap">{formatNumber(s.price)} Fcfa</td>
                                                            <td style={{ width: '90px' }}>
                                                                <Input type="number" min={0} bsSize="sm" value={sliceQty[s.id] ?? 0} onChange={(e) => setSlice(s.id, Number(e.target.value))} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default NewOrderPageContent;
