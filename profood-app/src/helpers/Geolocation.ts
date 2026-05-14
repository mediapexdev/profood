/**
 * Best-effort geolocation capture for delivery orders.
 *
 * We surface coordinates to the backend so the livreur app can deep-link
 * straight into Apple Maps / Google Maps navigation without forcing the OS
 * to geocode informal Dakar addresses. Permission denial, timeout, or any
 * other failure resolves to `null` so the order can still go through — we
 * never want to block a sale on a flaky GPS.
 *
 * Returned object is shaped to merge directly into the order payload.
 */
export interface DeliveryCoordinates {
    delivery_latitude: number;
    delivery_longitude: number;
}

const TIMEOUT_MS = 8000;

export function captureDeliveryCoordinates(): Promise<DeliveryCoordinates | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return Promise.resolve(null);
    }
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(null), TIMEOUT_MS + 500);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clearTimeout(timer);
                resolve({
                    delivery_latitude: pos.coords.latitude,
                    delivery_longitude: pos.coords.longitude,
                });
            },
            () => {
                clearTimeout(timer);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: TIMEOUT_MS,
                maximumAge: 5 * 60 * 1000,
            }
        );
    });
}
