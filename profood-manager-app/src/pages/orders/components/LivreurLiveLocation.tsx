import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs, faExternalLink } from '@fortawesome/free-solid-svg-icons';
import api from '../../../api/api';

interface LivreurLocationResponse {
    id: number;
    livreur_id: number;
    latitude: number | string;
    longitude: number | string;
    accuracy: number | string | null;
    recorded_at: string;
}

interface Props {
    livreurId: number;
}

const POLL_MS = 30_000;

function formatRelative(iso: string, t: (k: string) => string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diff = Date.now() - then;
    const minute = 60_000;
    const hour = 60 * minute;
    if (diff < minute) return t("À l'instant");
    if (diff < hour) return `${Math.floor(diff / minute)} min`;
    if (diff < 24 * hour) return `${Math.floor(diff / hour)} h`;
    return new Date(iso).toLocaleString('fr-FR');
}

/**
 * Live position panel for an assigned livreur. Polls
 * /get-livreur-last-location/{id} every 30s and renders an embedded
 * OpenStreetMap pin plus an "Open in Maps" deep-link.
 *
 * We use OSM's public embed (no API key, no tile cost for low-traffic
 * admin views) and skip Leaflet entirely: a single static pin on a
 * single map doesn't justify a JS map library dependency. The deep-
 * link button hands off to the manager's native maps app if they
 * actually need to navigate to the driver.
 */
export function LivreurLiveLocation({ livreurId }: Props) {
    const { t } = useTranslation();
    const [location, setLocation] = useState<LivreurLocationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchLocation = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await api.get<LivreurLocationResponse>(
                    `/get-livreur-last-location/${livreurId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (cancelled) return;
                setLocation(res.data);
                setNotFound(false);
            } catch (err: unknown) {
                if (cancelled) return;
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 404) {
                    setNotFound(true);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void fetchLocation();
        pollRef.current = setInterval(() => void fetchLocation(), POLL_MS);

        return () => {
            cancelled = true;
            if (pollRef.current !== null) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [livreurId]);

    const coords = useMemo(() => {
        if (!location) return null;
        const lat = typeof location.latitude === 'string' ? Number(location.latitude) : location.latitude;
        const lng = typeof location.longitude === 'string' ? Number(location.longitude) : location.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
    }, [location]);

    const embedUrl = useMemo(() => {
        if (!coords) return null;
        const delta = 0.005;
        const bbox = [
            coords.lng - delta,
            coords.lat - delta,
            coords.lng + delta,
            coords.lat + delta,
        ].join(',');
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`;
    }, [coords]);

    const directionsUrl = coords
        ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`
        : null;

    if (loading) {
        return (
            <div className='text-muted small mt-3'>
                <FontAwesomeIcon icon={faLocationCrosshairs} className='me-2' />
                {t('Chargement de la position…')}
            </div>
        );
    }
    if (notFound || !coords || !embedUrl) {
        return (
            <div className='text-muted small mt-3'>
                <FontAwesomeIcon icon={faLocationCrosshairs} className='me-2' />
                {t('Aucune position enregistrée pour ce livreur')}
            </div>
        );
    }

    return (
        <div className='mt-3'>
            <div className='d-flex justify-content-between align-items-center mb-2'>
                <span className='small fw-semibold text-gray-700'>
                    <FontAwesomeIcon icon={faLocationCrosshairs} className='me-2 text-success' />
                    {t('Position en direct')}
                </span>
                <span className='small text-muted'>
                    {t('Mise à jour')} {formatRelative(location!.recorded_at, t)}
                </span>
            </div>
            <div className='rounded-1 overflow-hidden border' style={{ height: 220 }}>
                <iframe
                    title={t('Position du livreur')}
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    loading='lazy'
                />
            </div>
            {directionsUrl && (
                <a
                    href={directionsUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='btn btn-sm btn-outline-primary rounded-1 mt-2'
                >
                    <FontAwesomeIcon icon={faExternalLink} className='me-2' />
                    {t('Ouvrir dans Maps')}
                </a>
            )}
        </div>
    );
}

export default LivreurLiveLocation;
