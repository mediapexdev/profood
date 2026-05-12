/**
 * BiometricEnrollPrompt — modal shown once, right after the driver's first
 * successful password login on a device that supports biometrics.
 *
 * Strict contract: the parent decides when to show this. It does not check
 * `biometric.available` itself because the caller already gated on it. The
 * "Pas maintenant" button just dismisses; the user can re-enrol later from
 * the profile page (TODO once that toggle is wired).
 */
import { useState } from 'react'
import { Icon } from './Icon'
import { useAuth } from '../contexts/AuthContext'

export function BiometricEnrollPrompt({ onDone }: { onDone: () => void }) {
    const { biometric, enrollBiometric } = useAuth()
    const [busy, setBusy] = useState(false)

    const handleEnroll = async () => {
        setBusy(true)
        try {
            await enrollBiometric()
        } finally {
            setBusy(false)
            onDone()
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon name="fingerprint" filled size="xl" className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Activer {biometric.label} ?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Évitez de retaper votre mot de passe à chaque ouverture. Vous pourrez le désactiver à tout moment depuis votre profil.
                </p>
                <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={busy}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-md hover:bg-primary/90 active:scale-[0.98] transition disabled:opacity-60"
                >
                    {busy ? 'Activation…' : `Activer ${biometric.label}`}
                </button>
                <button
                    type="button"
                    onClick={onDone}
                    disabled={busy}
                    className="mt-3 text-sm text-gray-500 hover:text-primary font-medium disabled:opacity-60"
                >
                    Pas maintenant
                </button>
            </div>
        </div>
    )
}
