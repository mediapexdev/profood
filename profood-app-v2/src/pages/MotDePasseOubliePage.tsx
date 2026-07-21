import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

/**
 * Réinitialisation par mot de passe — nécessite l'envoi d'un code SMS (OTP)
 * côté serveur (POST /password-reset { phone_number, code, password }).
 * Écran informatif tant que l'API n'est pas branchée ; l'UI 2 étapes
 * (demande de code → nouveau mot de passe) viendra avec le backend.
 */
export function MotDePasseOubliePage() {
  const navigate = useNavigate()
  return (
    <>
      <AppBar title="Mot de passe oublié" back />
      <Page noTabbar>
        <div className="mx-auto max-w-md px-6 pt-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-terre/15 grid place-items-center text-terre">
            <Icon name="sms" size={34} fill />
          </div>
          <h2 className="font-title text-xl mt-4">Réinitialisation par SMS</h2>
          <p className="text-taupe text-[14px] mt-2">
            Un code de vérification sera envoyé par SMS à votre numéro pour définir un nouveau mot de passe.
            Cette étape sera disponible dès l'activation du service.
          </p>
          <Button full className="mt-6" onClick={() => navigate('/connexion')}>Retour à la connexion</Button>
        </div>
      </Page>
    </>
  )
}
