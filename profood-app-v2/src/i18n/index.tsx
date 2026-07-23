/**
 * i18n maison, minimal et typé — FR (source) / EN. Pas d'i18next : ~60 lignes
 * suffisent, le bundle reste léger et une clé manquante casse la compilation.
 *
 *   const { t, lang, setLang } = useI18n()
 *   t('account.title')                       → « Mon compte »
 *   t('cart.items', { count: 3 })            → interpolation {count}
 *
 * Langue persistée en localStorage `lang` (même clé que l'app v1), défaut FR.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fr } from './fr'
import type { MsgKey } from './fr'
import { en } from './en'

export type Lang = 'fr' | 'en'
const LANG_KEY = 'lang'
const DICTS: Record<Lang, Record<MsgKey, string>> = { fr, en }

function initialLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY)
  return stored === 'en' || stored === 'fr' ? stored : 'fr'
}

interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: MsgKey, vars?: Record<string, string | number>) => string
  /** Locale BCP-47 pour les dates/heures (toLocaleDateString…). */
  locale: string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nValue>(() => {
    const dict = DICTS[lang]
    const t = (key: MsgKey, vars?: Record<string, string | number>) => {
      let msg: string = dict[key] ?? fr[key] ?? key
      if (vars) for (const [k, v] of Object.entries(vars)) msg = msg.replaceAll(`{${k}}`, String(v))
      return msg
    }
    return {
      lang,
      t,
      locale: lang === 'fr' ? 'fr-FR' : 'en-GB',
      setLang: (l: Lang) => {
        localStorage.setItem(LANG_KEY, l)
        setLangState(l)
      },
    }
  }, [lang])

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n doit être utilisé dans <I18nProvider>')
  return ctx
}
