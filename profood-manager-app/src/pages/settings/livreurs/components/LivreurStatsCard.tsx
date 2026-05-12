import React, { useCallback, useEffect, useState } from "react";

import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";

import { ArrowClockwise } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import { formatNumber } from "../../../../helpers/AssetHelpers";

interface LivreurStatsCardProps {
    livreurId: number;
}

interface LivreurStats {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    cancelled: number;
    totalAmount: number;
    deliveriesGrouped: number;
    deliveriesIndividual: number;
}

const todayISO = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const LivreurStatsCard: React.FC<LivreurStatsCardProps> = ({ livreurId }: LivreurStatsCardProps) => {
    const { t } = useTranslation();

    const [date, setDate] = useState<string>(todayISO());
    const [stats, setStats] = useState<LivreurStats | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(() => {
        const token = localStorage.getItem('token');
        if(!token) return;

        setLoading(true);
        setError(null);

        api.get('/get-livreur-stats', {
            headers: { Authorization: `Bearer ${token}` },
            params: { livreur_id: livreurId, date }
        }).then((res) => {
            setStats(res.data);
            setLoading(false);
        }).catch((err) => {
            setError(err?.response?.data?.message ?? t('Impossible de charger les statistiques'));
            setStats(null);
            setLoading(false);
        });
    }, [livreurId, date, t]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const Tile: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
        <Col xs={6} sm={4} md={3}>
            <div className={`p-4 rounded border bg-light-${color ?? 'info'} h-100`}>
                <div className="fs-8 text-gray-700">{label}</div>
                <div className={`fs-5 fw-bold text-${color ?? 'dark'}`}>{value}</div>
            </div>
        </Col>
    );

    return (
        <Card className="border-0">
            <CardHeader className="py-4">
                <Row className="align-items-center g-3">
                    <Col xs="sm">
                        <CardTitle tag="h3" className="title-color h6 m-0">
                            {t('Statistiques de livraison')}
                        </CardTitle>
                    </Col>
                    <Col xs="sm-auto">
                        <div className="d-flex align-items-center gap-2">
                            <FormGroup className="m-0">
                                <Label className="fs-9 mb-1 text-gray-700">{t('Date')}</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    bsSize="sm"
                                />
                            </FormGroup>
                            <button
                                type="button"
                                className="btn btn-info2 d-flex flex-center gap-2 rounded-1 mt-4"
                                onClick={fetchStats}
                                disabled={loading}
                                title={t('Rafraîchir')}
                            >
                                <ArrowClockwise />
                            </button>
                        </div>
                    </Col>
                </Row>
            </CardHeader>
            <CardBody className="pt-4">
                {error && (
                    <div className="alert alert-danger fs-8 mb-4">{error}</div>
                )}
                {!error && (
                    <Row className="g-3">
                        <Tile label={t('Total')} value={stats?.total ?? 0} color="info" />
                        <Tile label={t('Livrées')} value={stats?.completed ?? 0} color="success" />
                        <Tile label={t('En cours')} value={stats?.inProgress ?? 0} color="warning" />
                        <Tile label={t('En attente')} value={stats?.pending ?? 0} color="secondary" />
                        <Tile label={t('Annulées')} value={stats?.cancelled ?? 0} color="danger" />
                        <Tile label={t('Groupées')} value={stats?.deliveriesGrouped ?? 0} color="primary" />
                        <Tile label={t('Individuelles')} value={stats?.deliveriesIndividual ?? 0} color="primary" />
                        <Tile
                            label={t('Montant livré')}
                            value={`${formatNumber(stats?.totalAmount ?? 0)} Fcfa`}
                            color="success"
                        />
                    </Row>
                )}
            </CardBody>
        </Card>
    );
};

export default LivreurStatsCard;
