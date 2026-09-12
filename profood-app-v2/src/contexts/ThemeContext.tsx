import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeValue { isDark: boolean; toggle: () => void }
const ThemeContext = createContext<ThemeValue | null>(null)

// Android 15 dessine la barre d'état par-dessus la WebView : sans ce réglage,
// l'heure et les icônes restent blanches sur le fond clair de l'app.
async function syncNativeStatusBar(isDark: boolean) {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
  } catch {
    // plugin absent (web) : rien à faire
  }
}

function prefersDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : prefersDark()
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    syncNativeStatusBar(isDark)
  }, [isDark])

  return (
    <ThemeContext value={{ isDark, toggle: () => setIsDark((v) => !v) }}>
      {children}
    </ThemeContext>
  )
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>')
  return ctx
}
