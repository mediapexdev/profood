/**
 * UnlockGate — splash screen that intercepts protected routes when the driver
 * has opted into biometric unlock on this device.
 *
 * Renders nothing when:
 *   - bootstrapping is true (parent <App /> shows its own loader)
 *   - the session is not locked (typical case after a fresh login)
 *
 * Otherwise, shows a centered prompt with a single CTA that triggers the
 * native Face ID / fingerprint dialog via `unlock()`. A secondary action
 * ("Utiliser mon mot de passe") signs the driver out so they go back through
 * the password flow — this is the explicit escape hatch for cases where the
 * biometric is broken or the wrong person is holding the device.
 *
 * The component auto-fires the biometric prompt once on mount so the driver
 * does not have to tap an extra button after launching the app.
 */
import { useEffect, useRef } from 'react'
import { Icon } from './Icon'
import { useAuth } from '../contexts/AuthContext'

export function UnlockGate({ children }: { children: React.ReactNode }) {
    const { isLocked, bootstrapping, biometric, unlock, logout, driver } = useAuth()
    const autoTriggered = useRef(false)

    useEffect(() => {
        if (!isLocked || autoTriggered.current) return
        autoTriggered.current = true
        void unlock()
    }, [isLocked, unlock])

    if (bootstrapping) {
        return (
            <div className="min-h-dvh bg-background-light flex flex-col items-center justify-center gap-3">
                <span className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-primary animate-spin" />
                <p className="text-sm text-gray-500 font-medium">Chargement…</p>
            </div>
        )
    }

    if (!isLocked) return <>{children}</>

    return (
        <div className="min-h-dvh bg-background-light flex flex-col items-center justify-center px-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Icon name="lock" filled size="xl" className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Profood Livreur
            </h1>
            {driver && (
                <p className="text-sm text-gray-500 font-medium mb-8 text-center">
                    Connecté en tant que <span className="text-gray-900">{driver.name}</span>
                </p>
            )}
            <button
                type="button"
                onClick={() => void unlock()}
                className="w-full max-w-xs flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 active:scale-[0.98] transition"
            >
                <Icon name="fingerprint" size="md" />
                Déverrouiller avec {biometric.label}
            </button>
            <button
                type="button"
                onClick={() => void logout()}
                className="mt-4 text-sm text-gray-500 hover:text-primary font-medium"
            >
                Utiliser mon mot de passe
            </button>
        </div>
    )
}
