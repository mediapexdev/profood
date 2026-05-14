import { Geolocation } from '@capacitor/geolocation'
import apiClient from '../api/client'
import { isNative } from './platform'

/**
 * Periodically ping the backend with the driver's current GPS while at
 * least one delivery is in progress. Sized for the manager-side "where
 * is my livreur" view and the dashboard distance/time analytics —
 * accuracy matters less than continuity, so we use a 20s tick rather
 * than the noisier high-frequency watch the plugin offers.
 *
 * Web fallback is intentionally a no-op: the livreur app only tracks
 * meaningfully when running on a native device. We never want a browser
 * dev session prompting for location.
 */
const TICK_MS = 20_000

let tickHandle: ReturnType<typeof setInterval> | null = null

async function reportOnce(): Promise<void> {
    try {
        const pos = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15_000,
            maximumAge: 5_000,
        })
        await apiClient.post('/livreur-update-location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
        })
    } catch {
        // Network blips, denied permission, no fix — drop silently. The
        // next tick will retry. We never want tracking to surface errors
        // back into the UI.
    }
}

export async function startLocationTracking(): Promise<void> {
    if (!isNative) return
    if (tickHandle !== null) return
    try {
        const perm = await Geolocation.checkPermissions()
        if (perm.location !== 'granted') {
            const req = await Geolocation.requestPermissions()
            if (req.location !== 'granted') return
        }
    } catch {
        return
    }
    void reportOnce()
    tickHandle = setInterval(() => void reportOnce(), TICK_MS)
}

export function stopLocationTracking(): void {
    if (tickHandle !== null) {
        clearInterval(tickHandle)
        tickHandle = null
    }
}
