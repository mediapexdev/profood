import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { WHATSAPP_DISPLAY } from '../lib/contact'

const UPDATED = '13 septembre 2026'
const PHONE = `+221 ${WHATSAPP_DISPLAY}`
const EMAIL = 'admin.profood@gmail.com'

// Politique de l'application « Profood Livreur » (sn.profood.livreur), URL déclarée
// sur les stores : profood-app.com/confidentialite-livreur. Français uniquement.
const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: 'À qui s’adresse cette application',
    paragraphs: [
      `Profood Livreur est l’application réservée aux livreurs partenaires de PROFOOD, boucherie halal établie à Dakar, Sénégal. Elle n’est pas destinée au grand public : un compte est créé pour chaque livreur par le gestionnaire PROFOOD. Pour toute question relative à vos données : WhatsApp ${PHONE} ou ${EMAIL}.`,
    ],
  },
  {
    title: 'Données que nous collectons',
    paragraphs: [
      'À la création de votre compte par le gestionnaire : votre nom, votre prénom, votre numéro de téléphone et, le cas échéant, votre adresse e-mail. Votre mot de passe est stocké sous forme hachée.',
      'Pendant vos livraisons : votre position GPS, transmise régulièrement uniquement lorsqu’au moins une livraison est en cours, afin que le gestionnaire suive la tournée en temps réel et calcule les statistiques du jour (livraisons effectuées, distance parcourue, temps moyen).',
      'À chaque livraison : le statut que vous saisissez (en route, livrée, problème), l’heure de ces changements et, si vous la prenez, la photo de preuve de livraison avec la note associée.',
      'Nous ne collectons pas d’identifiant publicitaire et nous n’utilisons aucun outil de suivi publicitaire ni d’analyse d’audience tiers.',
    ],
  },
  {
    title: 'Déverrouillage biométrique',
    paragraphs: [
      'Si vous activez Face ID, Touch ID ou l’empreinte digitale, la vérification est effectuée par votre téléphone. Vos données biométriques ne quittent jamais votre appareil et ne sont jamais transmises à PROFOOD.',
    ],
  },
  {
    title: 'Utilisation des données',
    paragraphs: [
      'Vos données servent à : vous attribuer des commandes, vous guider vers les adresses de livraison, informer les clients de l’avancement de leur commande, suivre et sécuriser les tournées, et établir vos statistiques d’activité.',
      'Nous ne vendons ni ne louons vos données à des tiers.',
    ],
  },
  {
    title: 'Partage des données',
    paragraphs: [
      'Vos nom et numéro de téléphone peuvent être communiqués au client dont vous livrez la commande, pour qu’il puisse vous joindre. Votre position et vos statistiques sont visibles par l’équipe PROFOOD (gestionnaires et administrateurs). Aucun autre partage n’est effectué, sauf obligation légale.',
      'L’itinéraire est ouvert dans l’application de navigation de votre téléphone (Plans, Google Maps) : ces applications appliquent leur propre politique de confidentialité.',
    ],
  },
  {
    title: 'Conservation',
    paragraphs: [
      'Les données de compte sont conservées tant que vous êtes livreur partenaire. Les positions GPS sont conservées 90 jours puis supprimées. L’historique des livraisons et les preuves de livraison sont conservés pendant la durée requise par la législation sénégalaise en matière comptable et de gestion des litiges.',
    ],
  },
  {
    title: 'Vos droits et suppression du compte',
    paragraphs: [
      `Conformément à la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel, vous pouvez accéder à vos données, les faire corriger, demander leur suppression ou vous opposer à leur traitement. Écrivez-nous sur WhatsApp au ${PHONE} ou à ${EMAIL} en précisant le numéro de téléphone associé à votre compte. Nous répondons sous 30 jours.`,
      'Pour supprimer votre compte Profood Livreur : envoyez la demande par l’un de ces deux canaux. Le compte est désactivé sous 7 jours ; vos données personnelles (nom, téléphone, e-mail, positions GPS) sont supprimées, et les livraisons passées sont anonymisées, sauf obligation légale de conservation.',
    ],
  },
  {
    title: 'Sécurité',
    paragraphs: [
      'Les échanges entre l’application et nos serveurs sont chiffrés (HTTPS). Le jeton de session est stocké sur votre appareil et expire automatiquement. L’accès aux données est limité aux personnes qui en ont besoin pour gérer les livraisons.',
    ],
  },
  {
    title: 'Modifications',
    paragraphs: [
      'Toute modification de cette politique est publiée sur cette page avec sa date de mise à jour.',
    ],
  },
]

export function ConfidentialiteLivreurPage() {
  return (
    <>
      <AppBar title="Confidentialité – Profood Livreur" back />
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
