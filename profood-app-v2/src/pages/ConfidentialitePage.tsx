import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { useI18n } from '../i18n'
import { WHATSAPP_DISPLAY } from '../lib/contact'

const UPDATED = '12 septembre 2026'
const PHONE = `+221 ${WHATSAPP_DISPLAY}`

// Texte en français uniquement : référence contractuelle exigée par l'App Store
// et Google Play, publiée à l'URL déclarée dans les fiches (profood-app.com/confidentialite).
const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: 'Qui sommes-nous',
    paragraphs: [
      `PROFOOD est une boucherie halal établie à Dakar, Sénégal, qui vend et livre de la viande via son application mobile et son site profood-app.com. Pour toute question relative à vos données : WhatsApp ${PHONE}.`,
    ],
  },
  {
    title: 'Données que nous collectons',
    paragraphs: [
      "Nous collectons uniquement ce qui est nécessaire pour préparer et livrer vos commandes.",
      "Lors d'une commande, avec ou sans compte : votre nom, votre numéro de téléphone, votre adresse de livraison (zone et adresse complète), le contenu de la commande et le mode de paiement choisi. L'adresse e-mail est facultative et sert uniquement à vous envoyer les confirmations.",
      "Lors de la création d'un compte : les mêmes informations, plus un mot de passe stocké sous forme hachée. Un code à usage unique vous est envoyé par SMS pour vérifier votre numéro.",
      "Dans votre compte : vos adresses enregistrées, vos favoris et l'historique de vos commandes.",
      "Nous ne collectons pas votre position GPS, pas d'identifiant publicitaire, et nous n'utilisons aucun outil de suivi publicitaire ou d'analyse d'audience tiers.",
    ],
  },
  {
    title: 'Paiement',
    paragraphs: [
      "Si vous choisissez le paiement en ligne, la transaction est traitée par PayTech (Orange Money, Wave, carte bancaire). Vos informations de paiement sont saisies sur les pages de PayTech et ne transitent jamais par nos serveurs. Nous recevons uniquement la confirmation du paiement et son montant. Pour le paiement à la livraison, aucune donnée bancaire n'est collectée.",
    ],
  },
  {
    title: 'Utilisation des données',
    paragraphs: [
      "Vos données servent à : préparer et livrer votre commande, vous contacter au sujet de cette commande (livreur, confirmation, changement de statut), gérer votre compte et vous permettre de retrouver vos commandes passées, et répondre à vos demandes d'assistance.",
      "Nous n'envoyons pas de messages promotionnels sans votre accord et nous ne vendons ni ne louons vos données à des tiers.",
    ],
  },
  {
    title: 'Partage des données',
    paragraphs: [
      "Vos données sont accessibles à notre équipe (préparation, livraison, service client) et transmises aux prestataires strictement nécessaires : le livreur (nom, téléphone, adresse), PayTech (paiement en ligne), notre fournisseur d'envoi de SMS pour les codes de vérification et notre fournisseur d'e-mails pour les confirmations. Ces prestataires ne peuvent utiliser vos données qu'à ces fins.",
    ],
  },
  {
    title: 'Conservation',
    paragraphs: [
      "Les commandes et les informations de facturation sont conservées pendant la durée requise par la législation sénégalaise en matière comptable. Les données de compte sont conservées tant que le compte est actif. Les codes de vérification par SMS expirent après quelques minutes et ne sont jamais réutilisés.",
    ],
  },
  {
    title: 'Vos droits',
    paragraphs: [
      `Conformément à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel, vous pouvez accéder à vos données, les faire corriger, demander leur suppression ou vous opposer à leur traitement. Écrivez-nous sur WhatsApp au ${PHONE} en précisant le numéro de téléphone associé à votre compte. Nous répondons sous 30 jours.`,
      "Vous pouvez supprimer votre compte à tout moment sur simple demande par le même canal ; vos commandes passées sont alors anonymisées, sauf obligation légale de conservation.",
    ],
  },
  {
    title: 'Sécurité',
    paragraphs: [
      "Les échanges entre l'application et nos serveurs sont chiffrés (HTTPS). Les mots de passe sont hachés et ne sont jamais stockés en clair. L'accès aux données est limité aux personnes qui en ont besoin pour traiter votre commande.",
    ],
  },
  {
    title: 'Mineurs',
    paragraphs: [
      "L'application est destinée aux adultes. Nous ne collectons pas sciemment de données de personnes de moins de 18 ans.",
    ],
  },
  {
    title: 'Modifications',
    paragraphs: [
      'Toute modification de cette politique est publiée sur cette page avec sa date de mise à jour.',
    ],
  },
]

export function ConfidentialitePage() {
  const { t } = useI18n()
  return (
    <>
      <AppBar title={t('account.privacy')} back />
      <Page noTabbar>
        <article className="mx-auto max-w-2xl px-4 md:px-6 pt-4 pb-12">
          <p className="text-[13px] text-taupe">Dernière mise à jour : {UPDATED}</p>
          {SECTIONS.map((s) => (
            <section key={s.title} className="mt-7">
              <h2 className="font-title font-extrabold text-lg text-ink">{s.title}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 text-[15px] leading-relaxed text-ink/85">{p}</p>
              ))}
            </section>
          ))}
        </article>
      </Page>
    </>
  )
}
