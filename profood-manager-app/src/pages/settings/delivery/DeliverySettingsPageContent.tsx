import React, { useCallback, useEffect, useState } from "react";

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Container,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Row,
    Spinner,
    Table
} from "reactstrap";

import { useTranslation } from "react-i18next";

import api from "../../../api/api";
import useToast from "../../../components/hooks/useToast";

interface DeliverySettings {
    default_fee: number;
    free_shipping_threshold: number | null;
}

interface DeliveryZone {
    id: number;
    wording: string;
    delivery_fee: number | null;
    departement?: { wording: string } | null;
}

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

/**
 * Single commune row with an editable fee. Empty means "use the default fee".
 */
const ZoneRow: React.FC<{ zone: DeliveryZone; defaultFee: number; onSaved: (fee: number | null) => void }> = ({ zone, defaultFee, onSaved }) => {
    const { t } = useTranslation();
    const showToast = useToast();
    const [value, setValue] = useState<string>(zone.delivery_fee !== null ? String(zone.delivery_fee) : '');
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        api.post('/update-commune-fee', {
            commune_id: zone.id,
            delivery_fee: value.trim() === '' ? null : parseInt(value, 10),
        }, authHeaders())
            .then((res) => {
                onSaved(value.trim() === '' ? null : parseInt(value, 10));
                showToast(res.data?.message ? t(res.data.message) : t('Tarif de zone mis à jour'), 'success', { autoClose: 1500 });
            })
            .catch(() => showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error'))
            .finally(() => setSaving(false));
    };

    return (
        <tr>
            <td className="fs-8 content-color">{zone.wording}</td>
            <td className="fs-9 text-muted">{zone.departement?.wording ?? ''}</td>
            <td style={{ maxWidth: 160 }}>
                <InputGroup size="sm">
                    <Input
                        type="number"
                        min={0}
                        value={value}
                        placeholder={`${defaultFee} (${t('défaut')})`}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
                    />
                    <InputGroupText>Fcfa</InputGroupText>
                </InputGroup>
            </td>
            <td>
                <Button size="sm" color="info2" className="border-0 rounded-1" disabled={saving} onClick={save}>
                    {saving ? <Spinner size="sm" /> : t('Enregistrer')}
                </Button>
            </td>
        </tr>
    );
};

/**
 *
 */
const DeliverySettingsPageContent: React.FC = () => {
    const { t } = useTranslation();
    const showToast = useToast();

    const [defaultFee, setDefaultFee] = useState<string>('');
    const [freeThreshold, setFreeThreshold] = useState<string>('');
    const [savingSettings, setSavingSettings] = useState(false);

    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [zonesDefaultFee, setZonesDefaultFee] = useState<number>(0);
    const [query, setQuery] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const [loadingZones, setLoadingZones] = useState<boolean>(true);

    useEffect(() => {
        api.get('/get-delivery-settings', authHeaders())
            .then((res) => {
                const s: DeliverySettings = res.data?.settings;
                setDefaultFee(s?.default_fee != null ? String(s.default_fee) : '0');
                setFreeThreshold(s?.free_shipping_threshold != null ? String(s.free_shipping_threshold) : '');
            })
            .catch(() => showToast(t("Une erreur est survenue lors du chargement des paramètres de livraison."), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchZones = useCallback((q: string, p: number) => {
        setLoadingZones(true);
        api.get('/get-delivery-zones', { ...authHeaders(), params: { q, page: p, per_page: 30 } })
            .then((res) => {
                setZones(res.data?.zones?.data ?? []);
                setLastPage(res.data?.zones?.last_page ?? 1);
                setZonesDefaultFee(Number(res.data?.default_fee ?? 0));
            })
            .catch(() => showToast(t("Une erreur est survenue lors du chargement des zones."), 'error'))
            .finally(() => setLoadingZones(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchZones(query, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const runSearch = () => {
        setPage(1);
        fetchZones(query, 1);
    };

    const saveSettings = () => {
        setSavingSettings(true);
        api.post('/update-delivery-settings', {
            default_fee: defaultFee.trim() === '' ? 0 : parseInt(defaultFee, 10),
            free_shipping_threshold: freeThreshold.trim() === '' ? null : parseInt(freeThreshold, 10),
        }, authHeaders())
            .then((res) => {
                showToast(res.data?.message ? t(res.data.message) : t('Paramètres de livraison mis à jour'), 'success', { autoClose: 1500 });
                setZonesDefaultFee(defaultFee.trim() === '' ? 0 : parseInt(defaultFee, 10));
            })
            .catch(() => showToast(t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"), 'error'))
            .finally(() => setSavingSettings(false));
    };

    return (
        <div className="page-content position-relative">
            <Container fluid={true} className="page-content-container p-5 p-sm-6 p-md-8 p-xl-10">
                <Row className="gy-5">
                    <Col xs={12} lg={5}>
                        <Card className="border-0 shadow-sm h-100">
                            <CardHeader className="bg-transparent py-5">
                                <CardTitle tag='h3' className="fs-7 mb-0">{t('Paramètres généraux')}</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
                                    <FormGroup>
                                        <Label className="fs-8">{t('Forfait de livraison par défaut')}</Label>
                                        <InputGroup>
                                            <Input type="number" min={0} value={defaultFee}
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => setDefaultFee(e.currentTarget.value)} />
                                            <InputGroupText>Fcfa</InputGroupText>
                                        </InputGroup>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className="fs-8">{t('Livraison offerte à partir de')}</Label>
                                        <InputGroup>
                                            <Input type="number" min={0} value={freeThreshold}
                                                placeholder={t('Laisser vide = jamais offerte')}
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => setFreeThreshold(e.currentTarget.value)} />
                                            <InputGroupText>Fcfa</InputGroupText>
                                        </InputGroup>
                                    </FormGroup>
                                    <Button color="success" className="border-0 rounded-1 mt-2" disabled={savingSettings} onClick={saveSettings}>
                                        {savingSettings ? <Spinner size="sm" /> : t('Enregistrer')}
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xs={12} lg={7}>
                        <Card className="border-0 shadow-sm h-100">
                            <CardHeader className="bg-transparent py-5">
                                <CardTitle tag='h3' className="fs-7 mb-0">{t('Tarifs par zone')}</CardTitle>
                                <div className="fs-9 text-muted mt-1">{t('Une zone sans tarif utilise le forfait par défaut.')}</div>
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="mb-4">
                                    <InputGroup size="sm">
                                        <Input type="text" value={query} placeholder={t('Rechercher une commune')}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => setQuery(e.currentTarget.value)} />
                                        <Button color="info2" className="border-0" onClick={runSearch}>{t('Rechercher')}</Button>
                                    </InputGroup>
                                </Form>
                                {
                                    loadingZones
                                    ?
                                    <div className="d-flex align-items-center gap-2 text-muted fs-8"><Spinner size="sm" /><span>{t('Chargement...')}</span></div>
                                    :
                                    zones.length === 0
                                    ?
                                    <div className="fs-8 text-muted">{t('Aucune zone')}</div>
                                    :
                                    <div className="table-responsive">
                                        <Table className="align-middle mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="fw-semibold fs-8 text-muted">{t('Commune')}</th>
                                                    <th className="fw-semibold fs-8 text-muted">{t('Département')}</th>
                                                    <th className="fw-semibold fs-8 text-muted">{t('Tarif')}</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                zones.map((zone) => (
                                                    <ZoneRow
                                                        key={zone.id}
                                                        zone={zone}
                                                        defaultFee={zonesDefaultFee}
                                                        onSaved={(fee) => setZones((prev) => prev.map((z) => z.id === zone.id ? { ...z, delivery_fee: fee } : z))}
                                                    />
                                                ))
                                            }
                                            </tbody>
                                        </Table>
                                    </div>
                                }
                                {lastPage > 1 && (
                                    <div className="d-flex align-items-center justify-content-between mt-4">
                                        <Button size="sm" color="secondary" className="border-0 rounded-1" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                            {t('Précédent')}
                                        </Button>
                                        <span className="fs-9 text-muted">{page} / {lastPage}</span>
                                        <Button size="sm" color="secondary" className="border-0 rounded-1" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
                                            {t('Suivant')}
                                        </Button>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DeliverySettingsPageContent;
