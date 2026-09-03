import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'
import { haptic } from '../lib/haptics'
import { whatsappUrl, WHATSAPP_DISPLAY } from '../lib/contact'

const TAB_ROUTES = new Set(['/', '/boutique', '/box', '/panier', '/compte'])
const HIDDEN_PREFIXES = ['/checkout', '/guest-order-success', '/orders/']

function WhatsAppGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5L9.2 6.7c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.7-.2zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  )
}

/**
 * Bulle de discussion WhatsApp, maison (pas de script tiers) : un bouton
 * flottant qui ouvre une petite fenêtre de pré-message, puis wa.me.
 */
export function WhatsAppWidget() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { setOpen(false) }, [pathname])

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  const aboveDock = TAB_ROUTES.has(pathname)
  const bottom = aboveDock
    ? 'calc(var(--tabbar-h) + var(--sai-bottom) + 12px)'
    : 'calc(var(--sai-bottom) + 16px)'

  const start = () => {
    haptic('light')
    window.open(whatsappUrl(message.trim() || undefined), '_blank', 'noopener')
    setOpen(false)
  }

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-3 md:right-6 md:bottom-6!"
      style={{ bottom }}
    >
      {open && (
        <div
          role="dialog"
          aria-label={t('wa.title')}
          className="w-[calc(100vw-2rem)] max-w-[320px] overflow-hidden rounded-2xl border border-sable bg-surface shadow-[0_18px_50px_-18px_rgba(0,0,0,.45)] animate-[wa-pop_.22s_var(--ease)]"
        >
          <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
              <WhatsAppGlyph size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-title text-[15px] font-extrabold leading-tight">{t('wa.title')}</p>
              <p className="text-[12px] text-white/80">{t('wa.subtitle')}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('wa.close')} className="material-symbols-rounded text-white/80 hover:text-white">
              close
            </button>
          </div>
          <div className="bg-[#efe7dd] px-3 py-3 dark:bg-[#1b1512]">
            <div className="relative max-w-[85%] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[14px] leading-snug text-[#221610] shadow-sm dark:bg-[#2b221c] dark:text-ink">
              {t('wa.greeting')}
            </div>
          </div>
          <div className="p-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder={t('wa.placeholder')}
              className="w-full resize-none rounded-xl border border-sable bg-transparent px-3 py-2 text-[14px] outline-none focus:border-halal"
            />
            <button
              type="button"
              onClick={start}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] py-2.5 font-title text-[14px] font-bold text-white transition active:scale-[.98]"
            >
              <WhatsAppGlyph size={18} /> {t('wa.cta')}
            </button>
            <p className="mt-2 text-center text-[11px] text-taupe">{WHATSAPP_DISPLAY}</p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => { haptic('light'); setOpen((o) => !o) }}
        aria-label={t('wa.open')}
        aria-expanded={open}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_24px_-8px_rgba(37,211,102,.7)] transition hover:scale-105 active:scale-95"
      >
        {open ? <span className="material-symbols-rounded text-[28px]">close</span> : <WhatsAppGlyph size={30} />}
      </button>
    </div>
  )
}
