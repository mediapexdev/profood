import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import {
  DELIVERY_ZONES, zoneById, deliveryFee,
  fetchLocalites, filterLocalites, quoteDeliveryFee,
} from '../lib/delivery'
import type { Localite } from '../lib/delivery'
import { createOrder, savePendingPayment } from '../lib/orders'
import type { OrderCustomer } from '../lib/orders'
import {
  ordersApiEnabled, makeOrderHash, apiPhone, OrderApiError,
  placeGuestOrder, placeGuestOrderWithPayment,
  syncServerCart, placeCustomerOrder, placeCustomerOrderWithPayment, fetchCustomerOrders,
  validatePromoCode,
} from '../api/orders'
import type { PromoResult } from '../api/orders'
import { currentToken } from '../lib/auth'
import { getProfile, defaultAddress, rememberFromOrder } from '../lib/profile'
import type { SavedAddress } from '../lib/profile'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

/** Téléphone sénégalais accepté par le serveur : 33x ou 70/75/76/77/78. */
function isValidPhone(v: string): boolean {
  return /^(33|7[05678])\d{7}$/.test(apiPhone(v))
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

type PayMethod = 'cod' | 'online'

export function CheckoutPage() {
  const { t } = useI18n()
  const { lines, total: subtotal, clear } = useCart()
  const { user, isAuthenticated, mode: authApiMode } = useAuth()
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
  const [payMethod, setPayMethod] = useState<PayMethod>('cod')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Code promo (mode API) — remise indicative, le serveur re-valide.
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<PromoResult | null>(null)
  const [promoBusy, setPromoBusy] = useState(false)
  const [promoError, setPromoError] = useState('')

  // ── Localités API (mode commandes réelles) ──────────────────────────────
  const [localites, setLocalites] = useState<Localite[]>([])
  const [locQuery, setLocQuery] = useState('')
  const [localite, setLocalite] = useState<Localite | null>(null)
  const [locOpen, setLocOpen] = useState(false)
  const [quote, setQuote] = useState<{ fee: number; threshold: number | null; applied: boolean } | null>(null)
  const quoteSeq = useRef(0)
  const locInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ordersApiEnabled) return
    fetchLocalites().then(setLocalites).catch(() => setLocalites([]))
  }, [])

  // Restaure la localité mémorisée dans l'adresse par défaut (zoneId `loc:<id>`).
  useEffect(() => {
    if (!ordersApiEnabled || !localites.length) return
    const m = /^loc:(\d+)$/.exec(zoneId)
    if (m && !localite) {
      const found = localites.find((l) => l.id === Number(m[1]))
      if (found) {
        setLocalite(found)
        setLocQuery(found.wording)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localites])

  // Frais officiels (serveur) à chaque changement de localité / sous-total.
  useEffect(() => {
    if (!ordersApiEnabled || !localite) {
      setQuote(null)
      return
    }
    const seq = ++quoteSeq.current
    quoteDeliveryFee(localite.id, subtotal)
      .then((q) => {
        if (seq === quoteSeq.current) setQuote({ fee: q.fee, threshold: q.freeShippingThreshold, applied: q.freeShippingApplied })
      })
      .catch(() => {
        if (seq === quoteSeq.current) setQuote(null)
      })
  }, [localite, subtotal])

  const suggestions = useMemo(
    () => (ordersApiEnabled && locOpen && !localite ? filterLocalites(localites, locQuery, 10) : []),
    [localites, locQuery, locOpen, localite],
  )
  // La zone doit venir du référentiel : une saisie sans correspondance n'est pas retenue.
  const locNoMatch = ordersApiEnabled && !localite && localites.length > 0
    && locQuery.trim().length >= 2 && suggestions.length === 0

  const pickLocalite = (l: Localite) => {
    haptic('light')
    setLocalite(l)
    setLocQuery(l.wording)
    setLocOpen(false)
    if (savedAddresses.length) setPickedAddrId(undefined)
  }
  const clearLocalite = () => {
    setLocalite(null)
    setLocQuery('')
    setLocOpen(true)
    if (savedAddresses.length) setPickedAddrId(undefined)
    locInputRef.current?.focus()
  }

  const pickAddress = (a: SavedAddress) => {
    haptic('light')
    setPickedAddrId(a.id)
    setAddress(a.address)
    setZoneId(a.zoneId)
    const m = /^loc:(\d+)$/.exec(a.zoneId)
    if (ordersApiEnabled && m) {
      const found = localites.find((l) => l.id === Number(m[1]))
      setLocalite(found ?? null)
      setLocQuery(found?.wording ?? '')
    } else if (ordersApiEnabled) {
      setLocalite(null)
      setLocQuery(a.commune)
    }
  }
  const useNewAddress = () => {
    setPickedAddrId(undefined)
    setAddress('')
    setZoneId('')
    setLocalite(null)
    setLocQuery('')
  }

  // ── Frais / totaux ──────────────────────────────────────────────────────
  const zone = zoneById(zoneId)
  const fee = ordersApiEnabled ? quote?.fee ?? 0 : deliveryFee(zone, subtotal)
  const feeKnown = ordersApiEnabled ? !!localite && quote !== null : !!zone
  const freeShipping = ordersApiEnabled ? !!quote?.applied : !!zone && fee === 0
  const francoAmount = ordersApiEnabled ? quote?.threshold ?? null : zone?.franco ?? null
  const discount = promo?.valid ? Math.min(promo.discountAmount, subtotal + fee) : 0
  const total = Math.max(0, subtotal + fee - discount)

  const applyPromo = async () => {
    if (!promoInput.trim() || promoBusy) return
    setPromoBusy(true)
    setPromoError('')
    haptic('light')
    const res = await validatePromoCode(promoInput, subtotal, fee)
    if (res.valid) {
      setPromo(res)
      setPromoInput('')
    } else {
      setPromoError(res.message)
    }
    setPromoBusy(false)
  }
  const removePromo = () => {
    setPromo(null)
    setPromoError('')
  }

  // Session API réelle (token serveur, pas un compte local de démo).
  const apiToken = currentToken()
  const loggedApi = ordersApiEnabled && authApiMode === 'api' && isAuthenticated
    && !!apiToken && !apiToken.startsWith('local:') && !!user?.id

  const errors = {
    name: name.trim().length < 2 ? t('checkout.errorName') : '',
    phone: !isValidPhone(phone) ? t('auth.phoneInvalid') : '',
    email: !isValidEmail(email) ? t('auth.emailInvalid') : '',
    zone: ordersApiEnabled
      ? (!localite ? t('checkout.errorZoneApi') : '')
      : (!zoneId ? t('checkout.errorZone') : ''),
    address: address.trim().length < 4 ? t('checkout.errorAddress') : '',
  }
  const valid = !Object.values(errors).some(Boolean) && lines.length > 0

  if (!lines.length) {
    return (
      <>
        <AppBar title={t('checkout.title')} back />
        <Page noTabbar>
          <div className="px-6 pt-16 text-center text-taupe">
            <p className="font-title font-extrabold text-lg text-ink">{t('checkout.emptyTitle')}</p>
            <Button className="mt-4" onClick={() => navigate('/boutique')}>{t('common.viewShop')}</Button>
          </div>
        </Page>
      </>
    )
  }

  const buildCustomer = (): OrderCustomer => ({
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim() || undefined,
    address: address.trim(),
    zoneId: ordersApiEnabled ? `loc:${localite?.id ?? ''}` : zoneId,
    commune: ordersApiEnabled ? localite?.wording.split(',')[0].trim() ?? '' : zone?.commune ?? '',
    note: note.trim() || undefined,
  })

  const placeOrder = async () => {
    setTouched(true)
    setSubmitError('')
    if (!valid || submitting) return
    setSubmitting(true)
    haptic('medium')
    const customer = buildCustomer()

    // Mode démo (drapeau API commandes absent) : commande locale, comme avant.
    if (!ordersApiEnabled) {
      const order = createOrder({ customer, lines, subtotal, deliveryFee: fee })
      rememberFromOrder(customer)
      clear()
      navigate(`/confirmation/${order.token}`, { replace: true })
      return
    }

    try {
      const localiteId = localite?.id ?? null
      const serverAddress = customer.address

      if (payMethod === 'online') {
        // Brouillon gelé sous le hash → finalisé par la page de retour PayTech.
        const hash = await makeOrderHash()
        savePendingPayment({
          hash,
          createdAt: Date.now(),
          customer,
          lines: lines.map((l) => ({ name: l.name, qty: l.qty, unitPrice: l.unitPrice, image: l.image })),
          subtotal,
          deliveryFee: fee,
          discount: discount || undefined,
        })
        let url: string
        if (loggedApi) {
          await syncServerCart(lines, user!.id!, apiToken!)
          url = await placeCustomerOrderWithPayment({
            customerId: user!.id!, token: apiToken!, address: serverAddress,
            localiteId, montant: total, orderHash: hash,
            promotionCode: promo?.valid ? promo.code : undefined,
          })
        } else {
          url = await placeGuestOrderWithPayment(
            { name: customer.name, phone: customer.phone, email: customer.email, address: serverAddress,
              localiteId, lines, promotionCode: promo?.valid ? promo.code : undefined },
            hash,
          )
        }
        rememberFromOrder(customer)
        window.location.href = url // panier conservé jusqu'au retour de paiement
        return
      }

      // Paiement à la livraison.
      let serverRef = ''
      let serverId: number | undefined
      if (loggedApi) {
        await syncServerCart(lines, user!.id!, apiToken!)
        await placeCustomerOrder({
          customerId: user!.id!, token: apiToken!, address: serverAddress,
          localiteId, montant: total, orderHash: await makeOrderHash(),
          promotionCode: promo?.valid ? promo.code : undefined,
        })
        // La réponse ne renvoie pas la commande : on récupère la plus récente
        // pour rattacher réf + id serveur (suivi réel, annulation).
        const latest = (await fetchCustomerOrders(user!.userId!, apiToken!))[0]
        if (latest) {
          serverRef = latest.serverRef
          serverId = latest.serverId
        }
      } else {
        const placed = await placeGuestOrder({
          name: customer.name, phone: customer.phone, email: customer.email,
          address: serverAddress, localiteId, lines,
          promotionCode: promo?.valid ? promo.code : undefined,
        })
        serverRef = placed.serverRef
        serverId = placed.serverId
      }
      const order = createOrder({
        customer, lines, subtotal, deliveryFee: fee, discount: discount || undefined,
        serverRef: serverRef || undefined, serverId, paymentMethod: 'cod',
      })
      rememberFromOrder(customer)
      clear()
      navigate(`/confirmation/${order.token}`, { replace: true })
    } catch (e) {
      setSubmitError(e instanceof OrderApiError ? e.message : t('checkout.orderError'))
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppBar title={t('checkout.title')} back />
      <Page noTabbar>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-3 md:pt-6 flex flex-col gap-5">
          {/* Coordonnées */}
          <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-3.5">
            <h2 className="font-title font-extrabold text-lg">{t('checkout.sectionContact')}</h2>
            <Field label={t('checkout.fieldName')} error={touched ? errors.name : ''}>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('checkout.fieldNamePlaceholder')} autoComplete="name" />
            </Field>
            <Field label={t('common.phone')} error={touched ? errors.phone : ''}>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('common.phonePlaceholder')} inputMode="tel" autoComplete="tel" />
            </Field>
            <Field label={t('auth.emailOptionalLabel')} error={touched ? errors.email : ''}>
              <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder')} inputMode="email" autoComplete="email" />
            </Field>
          </section>

          {/* Livraison */}
          <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-3.5">
            <h2 className="font-title font-extrabold text-lg">{t('checkout.sectionDelivery')}</h2>

            {/* Adresses enregistrées (si profil connu) */}
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold text-taupe">{t('checkout.myAddresses')}</span>
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
                    {t('checkout.newAddress')}
                  </button>
                </div>
              </div>
            )}

            {ordersApiEnabled ? (
              <div className="relative">
                <Field label={t('checkout.fieldLocalite')} error={touched ? errors.zone : ''}>
                  <div className="relative">
                    <input
                      ref={locInputRef}
                      className={`${inputCls} ${localite ? 'pr-10' : ''}`}
                      value={locQuery}
                      onChange={(e) => { setLocQuery(e.target.value); setLocalite(null); setLocOpen(true) }}
                      onFocus={() => setLocOpen(true)}
                      onBlur={() => setTimeout(() => setLocOpen(false), 150)}
                      placeholder={t('checkout.localitePlaceholder')}
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={suggestions.length > 0}
                    />
                    {localite && (
                      <button
                        type="button"
                        onClick={clearLocalite}
                        aria-label={t('checkout.localiteChange')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full grid place-items-center text-taupe hover:bg-creme-dark active:bg-creme-dark transition-colors"
                      >
                        <Icon name="close" size={16} />
                      </button>
                    )}
                  </div>
                </Field>
                {locNoMatch && (
                  <p className="mt-1.5 text-[12px] text-taupe">{t('checkout.localiteNoMatch')}</p>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute z-20 left-0 right-0 mt-1 bg-surface border border-sable rounded-xl shadow-lg overflow-hidden">
                    {suggestions.map((l) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickLocalite(l)}
                          className="w-full text-left px-3.5 py-2.5 text-[14px] active:bg-creme-dark hover:bg-creme-dark transition-colors"
                        >
                          {l.wording}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Field label={t('checkout.fieldZone')} error={touched ? errors.zone : ''}>
                <select className={inputCls} value={zoneId} onChange={(e) => { setZoneId(e.target.value); if (savedAddresses.length) setPickedAddrId(undefined) }}>
                  <option value="">{t('checkout.chooseCommune')}</option>
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>{z.commune} · {fmtFcfa(z.fee)}</option>
                  ))}
                </select>
              </Field>
            )}
            {feeKnown && (
              <p className="-mt-1 text-[12px] text-taupe">
                {freeShipping
                  ? t('checkout.freeShippingApplied')
                  : francoAmount != null
                    ? t('checkout.freeShippingThreshold', { amount: fmtFcfa(francoAmount) })
                    : t('checkout.deliveryFeeAmount', { amount: fmtFcfa(fee) })}
              </p>
            )}
            <Field label={t('checkout.fieldAddress')} error={touched ? errors.address : ''}>
              <input className={inputCls} value={address} onChange={(e) => { setAddress(e.target.value); if (savedAddresses.length) setPickedAddrId(undefined) }} placeholder={t('checkout.addressPlaceholder')} autoComplete="street-address" />
            </Field>
            <Field label={t('checkout.fieldNote')}>
              <textarea className={`${inputCls} min-h-[64px] resize-none`} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('checkout.notePlaceholder')} />
            </Field>
          </section>

          {/* Paiement (choix réel seulement quand les commandes passent par l'API) */}
          {ordersApiEnabled && (
            <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-2.5">
              <h2 className="font-title font-extrabold text-lg">{t('checkout.sectionPayment')}</h2>
              {([
                { key: 'cod' as PayMethod, icon: 'payments', label: t('checkout.payCod'), hint: t('checkout.payCodHint') },
                { key: 'online' as PayMethod, icon: 'credit_card', label: t('checkout.payOnline'), hint: t('checkout.payOnlineHint') },
              ]).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => { haptic('light'); setPayMethod(m.key) }}
                  className={`flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-colors ${payMethod === m.key ? 'border-terre bg-terre/10' : 'border-sable'}`}
                >
                  <Icon name={m.icon} size={22} className={payMethod === m.key ? 'text-terre' : 'text-taupe'} />
                  <span className="flex-1">
                    <span className="block font-bold text-[15px]">{m.label}</span>
                    <span className="block text-[12px] text-taupe">{m.hint}</span>
                  </span>
                  <span className={`w-5 h-5 rounded-full border-[2px] grid place-items-center ${payMethod === m.key ? 'border-terre' : 'border-sable'}`}>
                    {payMethod === m.key && <span className="w-2.5 h-2.5 rounded-full bg-terre" />}
                  </span>
                </button>
              ))}
            </section>
          )}

          {/* Code promo (mode API) */}
          {ordersApiEnabled && (
            <section className="bg-surface border border-sable rounded-card p-4 flex flex-col gap-2.5">
              <h2 className="font-title font-extrabold text-lg">{t('promo.title')}</h2>
              {promo?.valid ? (
                <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-halal/40 bg-halal/10 px-3.5 py-2.5">
                  <Icon name="sell" size={20} className="text-halal" fill />
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-[14px]">{promo.code}</span>
                    <span className="block text-[12px] text-taupe">{t('promo.applied', { amount: fmtFcfa(discount) })}</span>
                  </div>
                  <button onClick={removePromo} className="text-[13px] font-bold text-taupe active:text-alerte">
                    {t('promo.remove')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      className={`${inputCls} uppercase`}
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                      onKeyDown={(e) => { if (e.key === 'Enter') applyPromo() }}
                      placeholder={t('promo.placeholder')}
                      autoComplete="off"
                    />
                    <Button disabled={promoBusy || !promoInput.trim()} onClick={applyPromo}>
                      {promoBusy ? '…' : t('promo.apply')}
                    </Button>
                  </div>
                  {promoError && <p className="text-[13px] font-semibold text-alerte">{promoError}</p>}
                </>
              )}
            </section>
          )}

          {/* Récapitulatif */}
          <section className="bg-creme-dark rounded-card p-4">
            <div className="flex justify-between text-[14px]"><span className="text-taupe">{t('common.subtotal')}</span><span className="tabular-nums font-semibold">{fmtFcfa(subtotal)}</span></div>
            <div className="flex justify-between text-[14px] mt-1.5">
              <span className="text-taupe">{t('common.delivery')}{ordersApiEnabled ? (localite ? ` · ${localite.wording.split(',')[0].trim()}` : '') : (zone ? ` · ${zone.commune}` : '')}</span>
              <span className="tabular-nums font-semibold">{feeKnown ? (freeShipping ? t('common.free') : fmtFcfa(fee)) : '—'}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[14px] mt-1.5 text-halal">
                <span>{t('promo.discountLine', { code: promo!.code })}</span>
                <span className="tabular-nums font-semibold">-{fmtFcfa(discount)}</span>
              </div>
            )}
            <div className="filet w-full my-3" />
            <div className="flex justify-between items-center">
              <span className="font-title font-extrabold">{t('common.total')}</span>
              <span className="font-title font-extrabold text-xl tabular-nums">{fmtFcfa(total)}</span>
            </div>
          </section>

          {submitError && (
            <p className="text-[13px] font-semibold text-alerte text-center -mt-2">{submitError}</p>
          )}

          <Button full disabled={(touched && !valid) || submitting} onClick={placeOrder}>
            {submitting
              ? t('checkout.submitting')
              : payMethod === 'online' && ordersApiEnabled
                ? t('checkout.payOnlineCta', { total: fmtFcfa(total) })
                : t('checkout.confirmCta', { total: fmtFcfa(total) })}
          </Button>
          <p className="text-[12px] text-taupe -mt-2 mb-1 text-center">
            {ordersApiEnabled && payMethod === 'online'
              ? t('checkout.noteOnline')
              : t('checkout.noteCod')}
          </p>
        </div>
      </Page>
    </>
  )
}
