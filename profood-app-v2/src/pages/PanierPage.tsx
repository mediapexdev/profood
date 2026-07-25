import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useCart } from '../contexts/CartContext'
import { fmtFcfa } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'
import { retryImgOnError } from '../lib/imgRetry'

export function PanierPage() {
  const { t } = useI18n()
  const { lines, total, count, setLineQty, clear } = useCart()
  const navigate = useNavigate()

  if (!lines.length) {
    return (
      <>
        <AppBar title={t('cart.title')} />
        <Page>
          <div className="flex flex-col items-center justify-center text-center gap-3 px-8 pt-24 text-taupe">
            <span className="opacity-40"><Icon name="shopping_bag" size={54} /></span>
            <p className="font-title font-extrabold text-lg text-ink">{t('cart.emptyTitle')}</p>
            <p className="text-[14px]">{t('cart.emptyHint')}</p>
            <Button className="mt-2" onClick={() => navigate('/boutique')}>{t('common.viewShop')}</Button>
          </div>
        </Page>
      </>
    )
  }

  return (
    <>
      <AppBar title={t('cart.title')} />
      <Page>
        <div className="mx-auto max-w-2xl px-4 md:px-6 pt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-taupe">{t('cart.items', { count })}</span>
            <button onClick={() => { haptic('light'); clear() }} className="text-[13px] font-bold text-taupe active:text-alerte inline-flex items-center gap-1">
              <Icon name="delete" size={16} /> {t('cart.clear')}
            </button>
          </div>

          {lines.map((l) => (
            <div key={l.id} className="flex items-center gap-3 bg-surface border border-sable rounded-card p-3">
              <img src={l.image} alt={l.name} onError={retryImgOnError} className="w-16 h-16 shrink-0 rounded-lg object-cover bg-creme" />
              <div className="flex-1 min-w-0">
                <p className="font-title font-bold text-[15px] truncate">{l.name}</p>
                {l.kind === 'box' && <p className="text-[11px] font-bold text-terre-deep">{t('box.composed', { count: l.cutIds?.length ?? 0 })}</p>}
                <p className="text-[12px] text-taupe tabular-nums">{fmtFcfa(l.unitPrice)}</p>
              </div>
              <div className="inline-flex items-center border-[1.5px] border-sable rounded-full overflow-hidden">
                <button className="w-9 h-9 grid place-items-center active:bg-creme-dark" aria-label={t('cart.decrease')} onClick={() => { haptic('light'); setLineQty(l.id, l.qty - 1) }}><Icon name="remove" size={18} /></button>
                <span className="min-w-9 text-center font-bold tabular-nums">{l.qty}</span>
                <button className="w-9 h-9 grid place-items-center active:bg-creme-dark" aria-label={t('cart.increase')} onClick={() => { haptic('light'); setLineQty(l.id, l.qty + 1) }}><Icon name="add" size={18} /></button>
              </div>
            </div>
          ))}

          <div className="pt-3">
            <div className="flex justify-between items-center">
              <span className="text-taupe">{t('common.subtotal')}</span>
              <span className="font-title font-extrabold text-xl tabular-nums">{fmtFcfa(total)}</span>
            </div>
            <p className="text-[12px] text-taupe mt-1">{t('cart.deliveryHint')}</p>
            <Button full className="mt-4" onClick={() => navigate('/checkout')}>{t('checkout.title')}</Button>
          </div>
        </div>
      </Page>
    </>
  )
}
