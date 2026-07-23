import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useCatalog } from '../contexts/CatalogContext'
import { useCart } from '../contexts/CartContext'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'

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
                <img src={b.image} alt={b.name} className="w-full aspect-[4/3] object-cover bg-creme" />
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
  const { boxes, slices } = useCatalog()
  const { addBox } = useCart()
  const navigate = useNavigate()
  const box = boxes.find((b) => b.id === Number(id))

  // Contenu choisi : quantité par découpe (une même découpe peut être doublée).
  const [counts, setCounts] = useState<Map<number, number>>(new Map())
  const total = useMemo(() => [...counts.values()].reduce((s, n) => s + n, 0), [counts])

  const eligible = useMemo(() => slices.filter((s) => s.availableInBox), [slices])

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

  const full = total === box.capacity
  const addToCart = () => {
    if (!full) return
    haptic('medium')
    const cutIds = [...counts.entries()].flatMap(([sliceId, n]) => Array.from({ length: n }, () => sliceId))
    addBox(t('boxes.cartLabel', { name: box.name }), box.price, cutIds, box.image, box.id)
    setCounts(new Map())
    navigate('/panier')
  }

  return (
    <>
      <AppBar title={box.name} back />
      <Page noTabbar>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-3 md:pt-6 pb-6">
          {/* En-tête du modèle */}
          <div className="flex items-center gap-4 bg-surface border border-sable rounded-card p-4">
            <img src={box.image} alt={box.name} className="w-20 h-20 rounded-xl object-cover bg-creme shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-title font-extrabold text-xl">{box.name}</p>
              <p className="text-[13px] text-taupe">{t('boxes.detailHint', { count: box.capacity })}</p>
              <p className="font-title font-extrabold tabular-nums mt-1">{fmtFcfa(box.price)}</p>
            </div>
          </div>

          {/* Progression */}
          <div className="flex items-center justify-between mt-4 mb-2">
            <span className="text-[13px] font-bold text-taupe">{t('boxes.progress')}</span>
            <span className={`font-title font-extrabold tabular-nums ${full ? 'text-halal' : ''}`}>{total} / {box.capacity}</span>
          </div>
          <div className="h-2 rounded-full bg-sable overflow-hidden">
            <div className="h-full bg-terre transition-all" style={{ width: `${Math.min(100, (total / box.capacity) * 100)}%` }} />
          </div>

          {/* Découpes éligibles */}
          <div className="flex flex-col gap-2 mt-4">
            {eligible.map((s) => {
              const n = counts.get(s.id) ?? 0
              return (
                <div key={s.id} className={`flex items-center gap-3 bg-surface border rounded-card p-3 transition-colors ${n ? 'border-terre' : 'border-sable'}`}>
                  <img src={s.image} alt={s.name} className="w-12 h-12 rounded-lg object-cover bg-creme shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-title font-bold text-[15px] truncate">{s.name}</p>
                    <p className="text-[12px] text-taupe">{s.category}</p>
                  </div>
                  {n === 0 ? (
                    <button
                      onClick={() => setCount(s.id, 1)}
                      disabled={total >= box.capacity}
                      className="text-[13px] font-bold text-terre border-[1.5px] border-terre rounded-full px-3.5 py-1.5 disabled:opacity-40"
                    >
                      {t('productCard.add')}
                    </button>
                  ) : (
                    <div className="inline-flex items-center border-[1.5px] border-sable rounded-full overflow-hidden">
                      <button className="w-9 h-9 grid place-items-center active:bg-creme-dark" aria-label={t('cart.decrease')} onClick={() => setCount(s.id, n - 1)}><Icon name="remove" size={18} /></button>
                      <span className="min-w-8 text-center font-bold tabular-nums">{n}</span>
                      <button className="w-9 h-9 grid place-items-center active:bg-creme-dark disabled:opacity-40" aria-label={t('cart.increase')} disabled={total >= box.capacity} onClick={() => setCount(s.id, n + 1)}><Icon name="add" size={18} /></button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {/* Barre d'action collante (sticky : suit le scroll, insensible aux
              transforms des transitions de page contrairement à `fixed`) */}
          <div className="sticky bottom-0 mt-4 -mx-4 md:-mx-6 bg-creme/95 backdrop-blur border-t border-sable px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-title font-extrabold tabular-nums text-lg leading-tight">{fmtFcfa(box.price)}</span>
                <span className="text-[11px] text-taupe tabular-nums">{total} / {box.capacity}</span>
              </div>
              <Button full disabled={!full} onClick={addToCart} className="flex-1">
                {full ? t('boxes.addToCart') : t('boxes.fillFirst', { count: box.capacity - total })}
              </Button>
            </div>
          </div>
        </div>
      </Page>
    </>
  )
}
