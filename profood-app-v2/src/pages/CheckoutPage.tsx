import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { useCart } from '../contexts/CartContext'
import { DELIVERY_ZONES, zoneById, deliveryFee } from '../lib/delivery'
import { createOrder } from '../lib/orders'
import { getProfile, defaultAddress, rememberFromOrder } from '../lib/profile'
import type { SavedAddress } from '../lib/profile'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'

/** Téléphone sénégalais : 9 chiffres commençant par 7, indicatif +221 toléré. */
function isValidPhone(v: string): boolean {
  const digits = v.replace(/[^\d]/g, '').replace(/^221/, '')
  return /^7\d{8}$/.test(digits)
}
/** E-mail facultatif (décision projet) : vide accepté, sinon format valide. */
function isValidEmail(v: string): boolean {
  return v.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold text-taupe">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-[12px] font-semibold text-alerte">{error}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border-[1.5px] border-sable bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-terre transition-colors'

export function CheckoutPage() {
  const { lines, total: subtotal, clear } = useCart()
  const navigate = useNavigate()

  // Pré-remplissage depuis le profil invité (dernières coordonnées + adresse).
  const [profile] = useState(getProfile)
  const initialAddr = defaultAddress(profile)
  const savedAddresses = profile.addresses

  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)
  const [email, setEmail] = useState(profile.email ?? '')
  const [zoneId, setZoneId] = useState(initialAddr?.zoneId ?? '')
  const [address, setAddress] = useState(initialAddr?.address ?? '')
  const [note, setNote] = useState('')
  const [pickedAddrId, setPickedAddrId] = useState<string | undefined>(initialAddr?.id)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const pickAddress = (a: SavedAddress) => {
    haptic('light')
    setPickedAddrId(a.id)
    setAddress(a.address)
    setZoneId(a.zoneId)
  }
  const useNewAddress = () => {
    setPickedAddrId(undefined)
    setAddress('')
    setZoneId('')
  }

  const zone = zoneById(zoneId)
  const fee = useMemo(() => deliveryFee(zone, subtotal), [zone, subtotal])
  const freeShipping = !!zone && fee === 0
  const total = subtotal + fee

  const errors = {
    name: name.trim().length < 2 ? 'Nom requis' : '',
    phone: !isValidPhone(phone) ? 'Numéro sénégalais invalide (ex. 77 123 45 67)' : '',
    email: !isValidEmail(email) ? 'E-mail invalide' : '',
    zone: !zoneId ? 'Choisissez votre zone' : '',
    address: address.trim().length < 4 ? 'Adresse requise' : '',
  }
  const valid = !Object.values(errors).some(Boolean) && lines.length > 0

  if (!lines.length) {
    return (
      <>
        <AppBar title="Commander" back />
        <Page noTabbar>
          <div className="px-6 pt-16 text-center text-taupe">
            <p className="font-title font-extrabold text-lg text-ink">Panier vide</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Voir la boutique</Button>
          </div>
        </Page>
      </>
    )
  }

  const placeOrder = () => {
    setTouched(true)
    if (!valid || submitting) return
    setSubmitting(true)
    haptic('medium')
    const order = createOrder({
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        zoneId,
        commune: zone!.commune,
        note: note.trim() || undefined,
      },
      lines,
      subtotal,
      deliveryFee: fee,
    })
    rememberFromOrder(order.customer)
    clear()
    navigate(`/confirmation/${order.token}`, { replace: true })
  }

  return (
    <>
      <AppBar title="Commander" back />
      <Page noTabbar>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-3 md:pt-6 flex flex-col gap-5">
          {/* Coordonnées */}
          <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-3.5">
            <h2 className="font-title font-extrabold text-lg">Vos coordonnées</h2>
            <Field label="Nom complet" error={touched ? errors.name : ''}>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Awa Ndiaye" autoComplete="name" />
            </Field>
            <Field label="Téléphone" error={touched ? errors.phone : ''}>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="77 123 45 67" inputMode="tel" autoComplete="tel" />
            </Field>
            <Field label="E-mail (facultatif)" error={touched ? errors.email : ''}>
              <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="awa@exemple.sn" inputMode="email" autoComplete="email" />
            </Field>
          </section>

          {/* Livraison */}
          <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-3.5">
            <h2 className="font-title font-extrabold text-lg">Livraison</h2>

            {/* Adresses enregistrées (si profil connu) */}
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold text-taupe">Mes adresses</span>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => pickAddress(a)}
                      className={`text-left rounded-xl border-[1.5px] px-3 py-2 max-w-full transition-colors ${pickedAddrId === a.id ? 'border-terre bg-terre/10' : 'border-sable bg-surface'}`}
                    >
                      <span className="block text-[13px] font-bold text-ink truncate">{a.commune}</span>
                      <span className="block text-[12px] text-taupe truncate max-w-[220px]">{a.address}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={useNewAddress}
                    className={`rounded-xl border-[1.5px] border-dashed px-3 py-2 text-[13px] font-bold transition-colors ${pickedAddrId === undefined ? 'border-terre text-terre' : 'border-sable text-taupe'}`}
                  >
                    + Nouvelle adresse
                  </button>
                </div>
              </div>
            )}

            <Field label="Zone (commune)" error={touched ? errors.zone : ''}>
              <select className={inputCls} value={zoneId} onChange={(e) => { setZoneId(e.target.value); if (savedAddresses.length) setPickedAddrId(undefined) }}>
                <option value="">— Choisir une commune —</option>
                {DELIVERY_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>{z.commune} · {fmtFcfa(z.fee)}</option>
                ))}
              </select>
            </Field>
            {zone && (
              <p className="-mt-1 text-[12px] text-taupe">
                {freeShipping
                  ? '🎉 Livraison offerte pour cette commande.'
                  : `Livraison offerte dès ${fmtFcfa(zone.franco)} d'achat sur cette zone.`}
              </p>
            )}
            <Field label="Adresse précise" error={touched ? errors.address : ''}>
              <input className={inputCls} value={address} onChange={(e) => { setAddress(e.target.value); if (savedAddresses.length) setPickedAddrId(undefined) }} placeholder="Rue, immeuble, point de repère" autoComplete="street-address" />
            </Field>
            <Field label="Note pour le livreur (facultatif)">
              <textarea className={`${inputCls} min-h-[64px] resize-none`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Étage, code, horaire…" />
            </Field>
          </section>

          {/* Récapitulatif */}
          <section className="bg-creme-dark rounded-card p-4">
            <div className="flex justify-between text-[14px]"><span className="text-taupe">Sous-total</span><span className="tabular-nums font-semibold">{fmtFcfa(subtotal)}</span></div>
            <div className="flex justify-between text-[14px] mt-1.5">
              <span className="text-taupe">Livraison{zone ? ` · ${zone.commune}` : ''}</span>
              <span className="tabular-nums font-semibold">{zone ? (freeShipping ? 'Offerte' : fmtFcfa(fee)) : '—'}</span>
            </div>
            <div className="filet w-full my-3" />
            <div className="flex justify-between items-center">
              <span className="font-title font-extrabold">Total</span>
              <span className="font-title font-extrabold text-xl tabular-nums">{fmtFcfa(total)}</span>
            </div>
          </section>

          <Button full disabled={touched && !valid} onClick={placeOrder}>
            Valider ma commande · {fmtFcfa(total)}
          </Button>
          <p className="text-[12px] text-taupe -mt-2 mb-1 text-center">
            Paiement à la livraison. Le poids exact est confirmé avant préparation.
          </p>
        </div>
      </Page>
    </>
  )
}
