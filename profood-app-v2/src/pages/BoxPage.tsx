import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Sheet } from '../components/shell/Sheet'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ProgressRing } from '../components/ui/ProgressRing'
import { useCatalog } from '../contexts/CatalogContext'
import { useCart } from '../contexts/CartContext'
import { categoryLabel } from '../lib/catalog'
import type { Slice } from '../lib/catalog'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'
import { retryImgOnError } from '../lib/imgRetry'

/**
 * Box prédéfinis (Noflaye, Woyofal, Xéweul, Téranga…) — le modèle fixe le
 * PRIX et la CAPACITÉ ; le client choisit son contenu parmi les découpes
 * `availableInBox`. Règle v1 conservée : la box doit être remplie EXACTEMENT
 * à sa capacité avant l'ajout au panier. Côté API, la ligne part en
 * {type:'box', box_type_id, slices:[…]} — le serveur facture le prix du modèle.
 */
export function BoxesPage() {
  const { t } = useI18n()
  const { boxes } = useCatalog()
  const navigate = useNavigate()

  return (
    <>
      <AppBar title={t('boxes.title')} />
      <Page>
        <div className="mx-auto max-w-5xl px-4 md:px-6 pt-3 md:pt-6">
          <p className="text-taupe text-[14px] max-w-xl">{t('boxes.subtitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {boxes.map((b) => (
              <button
                key={b.id}
                onClick={() => { haptic('light'); navigate(`/box/${b.id}`) }}
                className="text-left bg-surface border border-sable rounded-card overflow-hidden active:bg-creme-dark transition-colors"
              >
                <img src={b.image} alt={b.name} onError={retryImgOnError} className="w-full aspect-[4/3] object-cover bg-creme" />
                <div className="p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-title font-extrabold text-lg">{b.name}</span>
                    <span className="text-[11px] font-bold text-terre-deep bg-terre/15 rounded-full px-2.5 py-1">
                      {t('boxes.capacity', { count: b.capacity })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-title font-extrabold tabular-nums">{fmtFcfa(b.price)}</span>
                    <span className="text-[13px] font-bold text-terre inline-flex items-center gap-1">
                      {t('boxes.fill')} <Icon name="arrow_forward" size={16} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Page>
    </>
  )
}

export function BoxDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const { boxes, slices, categories } = useCatalog()
  const { addBox } = useCart()
  const navigate = useNavigate()
  const box = boxes.find((b) => b.id === Number(id))

  // Contenu choisi : quantité par découpe (une même découpe peut être doublée).
  const [counts, setCounts] = useState<Map<number, number>>(new Map())
  const [catId, setCatId] = useState<number | null>(null) // null = Tous
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState(false)
  const total = useMemo(() => [...counts.values()].reduce((s, n) => s + n, 0), [counts])

  const eligible = useMemo(() => slices.filter((s) => s.availableInBox), [slices])
  const shown = useMemo(
    () => (catId === null ? eligible : eligible.filter((s) => s.categoryId === catId)),
    [eligible, catId],
  )
  const chosen = useMemo(
    () => eligible.filter((s) => (counts.get(s.id) ?? 0) > 0),
    [eligible, counts],
  )

  if (!box) {
    return (
      <>
        <AppBar title={t('boxes.title')} back />
        <Page noTabbar><p className="p-6 text-taupe">{t('boxes.notFound')}</p></Page>
      </>
    )
  }

  const setCount = (sliceId: number, next: number) => {
    if (next < 0) return
    if (next > (counts.get(sliceId) ?? 0) && total >= box.capacity) return
    haptic('light')
    setCounts((prev) => {
      const m = new Map(prev)
      if (next === 0) m.delete(sliceId)
      else m.set(sliceId, next)
      return m
    })
  }

  /** Sélection équilibrée : répartit la capacité en tournant sur les catégories. */
  const autoFill = () => {
    haptic('medium')
    const byCat = categories
      .map((c) => eligible.filter((s) => s.categoryId === c.id))
      .filter((g) => g.length > 0)
    const m = new Map<number, number>()
    let placed = 0
    for (let round = 0; placed < box.capacity && round < box.capacity; round++) {
      let progressed = false
      for (const group of byCat) {
        if (placed >= box.capacity) break
        const s = group[round % group.length]
        if (round < group.length) {
          m.set(s.id, (m.get(s.id) ?? 0) + 1)
          placed++
          progressed = true
        }
      }
      if (!progressed) {
        // Catalogue plus petit que la capacité : on double en re-tournant.
        const flat = byCat.flat()
        const s = flat[placed % flat.length]
        m.set(s.id, (m.get(s.id) ?? 0) + 1)
        placed++
      }
    }
    setCounts(m)
    setToast(true)
    window.setTimeout(() => setToast(false), 2600)
  }

  const full = total === box.capacity
  const addToCart = () => {
    if (!full) return
    haptic('medium')
    const cutIds = [...counts.entries()].flatMap(([sliceId, n]) => Array.from({ length: n }, () => sliceId))
    addBox(t('boxes.cartLabel', { name: box.name }), box.price, cutIds, box.image, box.id)
    setCounts(new Map())
    setSheetOpen(false)
    navigate('/panier')
  }

  /** Stepper − n + : contour neutre à 0, plein terre dès qu'une unité est prise. */
  const Stepper = ({ s, compact = false }: { s: Slice; compact?: boolean }) => {
    const n = counts.get(s.id) ?? 0
    const active = n > 0
    return (
      <div
        className={`flex items-center justify-between rounded-full border-[1.5px] transition-colors ${
          active ? 'bg-terre border-terre text-white' : 'bg-surface border-sable text-ink'
        } ${compact ? 'w-[104px]' : 'w-full'}`}
      >
        <button
          className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} grid place-items-center disabled:opacity-35`}
          aria-label={t('cart.decrease')}
          disabled={n === 0}
          onClick={() => setCount(s.id, n - 1)}
        >
          <Icon name="remove" size={18} />
        </button>
        <span className="font-bold tabular-nums text-[15px]">{n}</span>
        <button
          className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} grid place-items-center disabled:opacity-35 ${active ? '' : 'text-terre'}`}
          aria-label={t('cart.increase')}
          disabled={total >= box.capacity}
          onClick={() => setCount(s.id, n + 1)}
        >
          <Icon name="add" size={18} />
        </button>
      </div>
    )
  }

  return (
    <>
      <AppBar title={t('boxes.cartLabel', { name: box.name })} back />
      <Page noTabbar>
        <div className="mx-auto max-w-3xl">
          {/* Sous-en-tête collant : prix + valider + jauge (patron du site vitrine) */}
          <div className="sticky top-0 z-10 bg-creme/90 backdrop-blur px-4 md:px-6 pt-3 pb-2.5 border-b border-sable">
            <div className="flex items-center justify-between gap-3">
              <span className="font-title font-extrabold text-terre tabular-nums text-lg">{fmtFcfa(box.price)}</span>
              <Button disabled={!full} onClick={addToCart} className="!py-2 !px-5 text-[14px]">
                {t('boxDetail.validate')}
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-2 flex-1 rounded-full bg-sable overflow-hidden">
                <div
                  className={`h-full transition-all ${full ? 'bg-halal' : 'bg-aqua'}`}
                  style={{ width: `${Math.min(100, (total / box.capacity) * 100)}%` }}
                />
              </div>
              <span className={`text-[12px] font-bold tabular-nums shrink-0 ${full ? 'text-halal' : 'text-taupe'}`}>
                {t('boxDetail.cuts', { n: total, total: box.capacity })}
              </span>
            </div>
          </div>

          <div className="px-4 md:px-6">
            {/* Filtres catégorie + remplissage auto */}
            <div className="flex gap-2 overflow-x-auto no-select pt-3 -mx-4 px-4 md:mx-0 md:px-0">
              {[null, ...categories.map((c) => c.id)].map((cid) => {
                const label = cid === null ? t('boxDetail.all') : categoryLabel(categories.find((c) => c.id === cid)!.name)
                const isOn = catId === cid
                return (
                  <button
                    key={cid ?? 'all'}
                    onClick={() => { haptic('light'); setCatId(cid) }}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold border-[1.5px] transition-colors ${
                      isOn ? 'bg-ink text-surface border-ink' : 'bg-surface text-ink border-sable'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end pt-2.5">
              <button
                onClick={autoFill}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-bold border-[1.5px] border-aqua text-aqua transition-colors active:bg-aqua/10"
              >
                ✨ {t('boxDetail.autoFill')}
              </button>
            </div>

            {/* État de la sélection */}
            <p className={`text-[13.5px] mt-2.5 ${full ? 'font-bold text-halal' : 'text-taupe'}`}>
              {full
                ? t('boxDetail.complete')
                : t('boxDetail.choose', { count: box.capacity, total: eligible.length })}
            </p>

            {/* Grille de découpes (cartes photo + stepper, comme le site) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-3">
              {shown.map((s) => {
                const n = counts.get(s.id) ?? 0
                return (
                  <div
                    key={s.id}
                    className={`relative bg-surface border rounded-card overflow-hidden transition-colors ${n ? 'border-terre' : 'border-sable'}`}
                  >
                    {n > 0 && (
                      <span className="absolute top-2 right-2 z-[1] grid min-w-[22px] h-[22px] px-1 place-items-center rounded-full bg-terre text-white text-[12px] font-bold animate-pop">
                        {n}
                      </span>
                    )}
                    <img src={s.image} alt={s.name} loading="lazy" onError={retryImgOnError} className="w-full aspect-[4/3] object-cover bg-creme" />
                    <div className="p-2.5">
                      <p className="font-title font-bold text-[14px] leading-tight line-clamp-2">{s.name}</p>
                      <p className="text-[12px] text-taupe mt-0.5">{categoryLabel(s.category)}</p>
                      <div className="mt-2">
                        <Stepper s={s} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Toast du remplissage auto */}
          {toast && (
            <div className="fixed left-4 right-4 bottom-24 z-40 rounded-card bg-ink text-surface text-center text-[13.5px] font-bold px-4 py-3 animate-pop">
              {t('boxDetail.autoFilled')}
            </div>
          )}

          {/* Barre collante « Voir ma box » (récap en sheet). Le bottom négatif
              absorbe le padding bas du shell pour coller au bord de l'écran. */}
          <div
            className="sticky z-20 mt-4 px-4 md:px-6 pt-3 bg-creme/95 backdrop-blur border-t border-sable"
            style={{
              bottom: 'calc(-1 * (var(--sai-bottom) + 24px))',
              paddingBottom: 'calc(var(--sai-bottom) + 12px)',
            }}
          >
            <button
              onClick={() => { haptic('light'); setSheetOpen(true) }}
              className="w-full flex items-center gap-3 rounded-full bg-ink text-surface pl-2.5 pr-5 py-2 font-title font-bold text-[15px] active:opacity-90"
            >
              {/* La box se remplit sous les yeux : anneau de progression. */}
              <ProgressRing
                value={total}
                max={box.capacity}
                size={38}
                stroke={3.5}
                className={full ? 'text-halal' : 'text-terre'}
              >
                <span className="text-[11px] font-extrabold tabular-nums">{total}</span>
              </ProgressRing>
              <span className="flex-1 text-left">{t('boxDetail.viewMyBox', { n: total, total: box.capacity })}</span>
              <span className="text-terre tabular-nums">{fmtFcfa(box.price)}</span>
            </button>
          </div>
        </div>
      </Page>

      {/* Récap de la box */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={t('boxDetail.myBox', { name: box.name })}>
        <div className="flex items-center justify-between -mt-1">
          <span className="font-title font-extrabold text-terre tabular-nums text-lg">{fmtFcfa(box.price)}</span>
          {chosen.length > 0 && (
            <button
              onClick={() => { haptic('light'); setCounts(new Map()) }}
              className="text-[13px] font-bold text-taupe underline underline-offset-2"
            >
              {t('boxDetail.removeAll')}
            </button>
          )}
        </div>
        <div className="flex flex-col divide-y divide-sable mt-2">
          {chosen.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="font-title font-bold text-[15px] truncate">{s.name}</p>
                <p className="text-[12px] text-taupe">{categoryLabel(s.category)}</p>
              </div>
              <Stepper s={s} compact />
            </div>
          ))}
          {chosen.length === 0 && (
            <p className="py-4 text-[14px] text-taupe">{t('boxDetail.choose', { count: box.capacity, total: eligible.length })}</p>
          )}
        </div>
        <p className={`text-[13.5px] font-bold mt-3 ${full ? 'text-halal' : 'text-taupe'}`}>
          {full ? t('boxDetail.completeShort') : t('boxes.fillFirst', { count: box.capacity - total })}
        </p>
        <div className="py-3">
          <Button full disabled={!full} onClick={addToCart}>{t('boxDetail.validate')}</Button>
        </div>
      </Sheet>
    </>
  )
}
