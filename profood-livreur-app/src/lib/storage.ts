/**
 * Storage abstraction over `@capacitor/preferences` (native) and `localStorage`
 * (web). Centralises persistence so AuthContext and biometric helpers do not
 * scatter `localStorage` calls or have to special-case platforms inline.
 *
 * Threat model note: `@capacitor/preferences` writes to NSUserDefaults on iOS
 * and SharedPreferences on Android — sandboxed per app but NOT encrypted.
 * The auth token is therefore protected by the device-unlock state and the
 * biometric UX gate added in AuthContext, not by at-rest encryption. A
 * rooted/jailbroken device can still read it. If we later need at-rest
 * encryption, swap to `@aparajita/capacitor-secure-storage` without changing
 * the call sites.
 */
import { Preferences } from '@capacitor/preferences'
import { isNative } from './platform'

export const StorageKeys = {
    token: 'profood_livreur_token',
    driver: 'profood_livreur_driver',
    biometricEnrolled: 'profood_livreur_biometric_enrolled',
} as const

export async function setItem(key: string, value: string): Promise<void> {
    if (isNative) {
        await Preferences.set({ key, value })
        return
    }
    localStorage.setItem(key, value)
}

export async function getItem(key: string): Promise<string | null> {
    if (isNative) {
        const { value } = await Preferences.get({ key })
        return value
    }
    return localStorage.getItem(key)
}

export async function removeItem(key: string): Promise<void> {
    if (isNative) {
        await Preferences.remove({ key })
        return
    }
    localStorage.removeItem(key)
}
