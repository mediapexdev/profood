import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { AppBar } from '../components/shell/AppBar'
import { ProductCard } from '../components/ProductCard'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useCatalog } from '../contexts/CatalogContext'
import { fmtFcfa } from '../lib/format'
import { useReveal } from '../lib/useReveal'
import { haptic } from '../lib/haptics'
import { useI18n } from '../i18n'
import type { MsgKey } from '../i18n/fr'

/**
 * Accueil vitrine — reprend section par section la home du site profood-web
 * (référence design) : héro sur bannière photo, « Comment ça marche »,
 * Nos Box, mini-quiz de recommandation, aperçu boutique, chiffres clés,
 * pied de page marque. L'univers mer, retiré du périmètre v2, est omis.
 */

const BOX_DESC: Record<number, MsgKey> = {
  1: 'home.boxDesc1',
  2: 'home.boxDesc2',
  3: 'home.boxDesc3',
  4: 'home.boxDesc4',
}

export function AccueilPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { boxes, slices } = useCatalog()

  // Quiz : personnes (0–3) × durée (0–3) → index dans les box triées par capacité.
  const [persons, setPersons] = useState<number | null>(null)
  const [days, setDays] = useState<number | null>(null)
  const reco = useMemo(() => {
    if (persons === null || days === null || boxes.length === 0) return null
    const idx = Math.min(boxes.length - 1, Math.round(((persons + days) / 6) * (boxes.length - 1)))
    return boxes[idx]
  }, [persons, days, boxes])

  const preview = slices.slice(0, 4)
  const how = useReveal<HTMLDivElement>()

  const P_OPTS: MsgKey[] = ['home.quizP1', 'home.quizP2', 'home.quizP3', 'home.quizP4']
  const D_OPTS: MsgKey[] = ['home.quizD1', 'home.quizD2', 'home.quizD3', 'home.quizD4']

  return (
    <>
      <AppBar title="PROFOOD" brand />
      <Page>
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {/* ---- Héro ---- */}
          <section className="relative mt-3 md:mt-8 rounded-card overflow-hidden bg-encre">
            <img
              src="/images/banners/viande-crue.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-encre/90 via-encre/40 to-encre/20" />
            <div className="relative px-5 py-10 md:px-12 md:py-20 max-w-2xl">
              <p className="text-[11px] md:text-[12px] font-bold tracking-[.18em] uppercase text-lumiere">
                {t('home.heroKicker')}
              </p>
              <h1 className="text-white text-[30px] md:text-[52px] leading-[1.05] mt-2">
                {t('home.heroTitleLead')} <span className="text-terre">{t('home.heroTitleHighlight')}</span>
              </h1>
              <p className="text-white/85 text-[14px] md:text-base mt-3 max-w-md">{t('home.heroSubtitle')}</p>
              <div className="flex flex-wrap gap-2.5 mt-5">
                <Button onClick={() => navigate('/box')}>{t('home.ctaCreateBox')}</Button>
                <Button
                  variant="ghost"
                  className="border-white/40 text-white active:bg-white/10"
                  onClick={() => navigate('/boutique')}
                >
                  {t('home.ctaShop')}
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-6 text-white/80 text-[12px] font-bold">
                {(['home.badgeFreeDelivery', 'home.badgeFast', 'home.badgeHalal'] as MsgKey[]).map((k) => (
                  <li key={k} className="inline-flex items-center gap-1.5">
                    <Icon name="check_circle" size={15} className="text-frais" fill /> {t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---- Comment ça marche ---- */}
          <section className="pt-8 md:pt-14">
            <h2 className="text-[24px] md:text-3xl">{t('home.howTitle')}</h2>
            <span className="filet w-24 mt-3" />
            <div ref={how.ref} className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mt-5">
              {([
                ['home.how1Title', 'home.how1Text', 'takeout_dining'],
                ['home.how2Title', 'home.how2Text', 'shopping_basket'],
                ['home.how3Title', 'home.how3Text', 'local_shipping'],
              ] as [MsgKey, MsgKey, string][]).map(([title, text, icon], i) => (
                <div
                  key={title}
                  style={{ '--reveal-delay': `${i * 130}ms` } as React.CSSProperties}
                  className={`bg-surface border border-sable rounded-card p-4 md:p-5 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover ${how.visible ? 'reveal-in' : 'reveal'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="step-icon grid h-11 w-11 place-items-center rounded-full bg-terre/12 text-terre">
                      <Icon name={icon} size={24} fill />
                    </span>
                    <span className="text-[11px] font-bold tracking-[.14em] uppercase text-taupe">
                      {t('home.howStep', { n: i + 1 })}
                    </span>
                  </div>
                  <p className="font-title font-extrabold text-[17px] mt-3">{t(title)}</p>
                  <p className="text-taupe text-[13.5px] mt-1">{t(text)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---- Nos Box ---- */}
          <section id="nos-box" className="pt-8 md:pt-14">
            <h2 className="text-[24px] md:text-3xl">{t('home.boxesTitle')}</h2>
            <p className="text-taupe text-[14px] mt-1 max-w-xl">{t('home.boxesSubtitle')}</p>
            <span className="filet w-24 mt-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-5">
              {boxes.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { haptic('light'); navigate(`/box/${b.id}`) }}
                  className="relative text-left bg-surface border border-sable rounded-card overflow-hidden active:bg-creme-dark transition-colors"
                >
                  {b.id === 2 && (
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-terre text-white text-[11px] font-bold px-2.5 py-1">
                      {t('home.boxPopular')}
                    </span>
                  )}
                  <img src={b.image} alt={b.name} className="w-full aspect-[4/3] object-cover bg-creme" />
                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-title font-extrabold text-lg">{b.name}</span>
                      <span className="shrink-0 text-[11px] font-bold text-terre-deep bg-terre/15 rounded-full px-2.5 py-1">
                        {t('boxes.capacity', { count: b.capacity })}
                      </span>
                    </div>
                    <p className="font-title font-extrabold tabular-nums mt-2">{fmtFcfa(b.price)}</p>
                    <p className="text-[12px] text-taupe tabular-nums">
                      {t('home.boxPerCut', { price: fmtFcfa(Math.round(b.price / b.capacity)) })}
                    </p>
                    {BOX_DESC[b.id] && <p className="text-[13px] text-taupe mt-2">{t(BOX_DESC[b.id])}</p>}
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold text-terre mt-2.5">
                      {t('boxes.fill')} <Icon name="arrow_forward" size={16} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ---- Quiz : quelle box ? ---- */}
          <section className="pt-8 md:pt-14">
            <div className="bg-surface border border-sable rounded-card p-4 md:p-8">
              <h2 className="text-[22px] md:text-2xl">{t('home.quizTitle')}</h2>
              <p className="text-taupe text-[14px] mt-1">{t('home.quizSubtitle')}</p>
              {([
                [t('home.quizQ1'), P_OPTS, persons, setPersons],
                [t('home.quizQ2'), D_OPTS, days, setDays],
              ] as [string, MsgKey[], number | null, (v: number) => void][]).map(([q, opts, val, set]) => (
                <div key={q} className="mt-4">
                  <p className="text-[13px] font-bold text-ink">{q}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opts.map((k, i) => (
                      <button
                        key={k}
                        onClick={() => { haptic('light'); set(i) }}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold border-[1.5px] transition-colors ${
                          val === i ? 'bg-terre text-white border-terre' : 'bg-surface text-ink border-sable'
                        }`}
                      >
                        {t(k)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {reco && (
                <div className="mt-5 flex flex-wrap items-center gap-3 bg-terre/10 border border-terre/30 rounded-card px-4 py-3">
                  <img src={reco.image} alt={reco.name} className="w-14 h-14 rounded-xl object-cover bg-creme" />
                  <div className="flex-1 min-w-[140px]">
                    <p className="text-[11px] font-bold tracking-[.14em] uppercase text-terre-deep">{t('home.quizReco')}</p>
                    <p className="font-title font-extrabold">
                      {reco.name} · {t('boxes.capacity', { count: reco.capacity })}
                    </p>
                    <p className="text-[13px] text-taupe tabular-nums">{fmtFcfa(reco.price)}</p>
                  </div>
                  <Button onClick={() => navigate(`/box/${reco.id}`)}>{t('boxes.fill')}</Button>
                </div>
              )}
            </div>
          </section>

          {/* ---- Aperçu boutique ---- */}
          <section className="pt-8 md:pt-14">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-[24px] md:text-3xl">{t('home.shopTitle')}</h2>
                <p className="text-taupe text-[14px] mt-1">{t('home.shopSubtitle')}</p>
              </div>
              <button
                onClick={() => { haptic('light'); navigate('/boutique') }}
                className="hidden sm:inline-flex items-center gap-1 shrink-0 text-[14px] font-bold text-terre"
              >
                {t('home.shopCta')} <Icon name="arrow_forward" size={17} />
              </button>
            </div>
            <span className="filet w-24 mt-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-5">
              {preview.map((s) => <ProductCard key={s.id} slice={s} />)}
            </div>
            <Button full variant="ghost" className="mt-4 sm:hidden" onClick={() => navigate('/boutique')}>
              {t('home.shopCta')}
            </Button>
          </section>

          {/* ---- Chiffres clés ---- */}
          <section className="pt-8 md:pt-14">
            <div className="bg-encre rounded-card px-4 py-6 md:px-8 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
              {([
                ['home.stat1Value', 'home.stat1Label'],
                ['home.stat2Value', 'home.stat2Label'],
                ['home.stat3Value', 'home.stat3Label'],
                ['home.stat4Value', 'home.stat4Label'],
              ] as [MsgKey, MsgKey][]).map(([v, l]) => (
                <div key={v} className="text-center">
                  <p className="font-title font-extrabold text-terre text-[26px] md:text-[32px] tabular-nums">{t(v)}</p>
                  <p className="text-white/75 text-[12px] md:text-[13px] mt-1">{t(l)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---- Pied de page marque ---- */}
          <footer className="py-10 md:py-14 text-center">
            <img
              src="/logo-profood-mini.svg"
              alt="PROFOOD"
              className="h-8 mx-auto dark:[filter:invert(1)_hue-rotate(180deg)]"
            />
            <p className="font-title font-extrabold mt-3">{t('home.footerTagline')}</p>
            <p className="text-taupe text-[13px] mt-1">{t('home.footerNote')}</p>
          </footer>
        </div>
      </Page>
    </>
  )
}
