/**
 * Biometric helpers wrapping `@aparajita/capacitor-biometric-auth`.
 *
 * On web (no Capacitor) every function returns the safe "not available" answer
 * so the rest of the app can call these without platform checks.
 *
 * The plugin is the UX gate: a successful `authenticate()` call only proves
 * the user passed the system biometric prompt — it does NOT encrypt anything.
 * The token itself is stored in @capacitor/preferences (see lib/storage.ts).
 */
import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth'
import { isNative } from './platform'

export type BiometryLabel =
    | 'Face ID'
    | 'Touch ID'
    | 'empreinte digitale'
    | 'reconnaissance faciale'
    | 'reconnaissance par iris'
    | 'biométrie'

function labelFor(type: BiometryType): BiometryLabel {
    switch (type) {
        case BiometryType.faceId:
            return 'Face ID'
        case BiometryType.touchId:
            return 'Touch ID'
        case BiometryType.fingerprintAuthentication:
            return 'empreinte digitale'
        case BiometryType.faceAuthentication:
            return 'reconnaissance faciale'
        case BiometryType.irisAuthentication:
            return 'reconnaissance par iris'
        default:
            return 'biométrie'
    }
}

export interface BiometricStatus {
    available: boolean
    label: BiometryLabel
}

/**
 * Reports whether the device currently has at least one enrolled biometric
 * factor we can prompt for. On web (or on a native device with no enrolled
 * fingerprint/face), `available` is false and the caller should skip the
 * enrollment prompt entirely.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
    if (!isNative) {
        return { available: false, label: 'biométrie' }
    }
    try {
        const result = await BiometricAuth.checkBiometry()
        return {
            available: result.isAvailable,
            label: labelFor(result.biometryType),
        }
    } catch {
        return { available: false, label: 'biométrie' }
    }
}

/**
 * Prompts the native biometric dialog. Resolves to true when the user passed
 * the prompt, false when they cancelled or failed. Never throws — the caller
 * handles both outcomes the same way (stay locked).
 */
export async function promptBiometric(reason: string): Promise<boolean> {
    if (!isNative) return false
    try {
        await BiometricAuth.authenticate({
            reason,
            cancelTitle: 'Annuler',
            allowDeviceCredential: true,
            iosFallbackTitle: 'Utiliser le code',
            androidTitle: 'Profood Livreur',
            androidSubtitle: 'Déverrouiller votre session',
        })
        return true
    } catch {
        return false
    }
}
