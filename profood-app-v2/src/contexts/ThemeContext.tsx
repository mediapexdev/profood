import { createContext, useContext, useEffect, useState } from 'react'

interface ThemeValue { isDark: boolean; toggle: () => void }
const ThemeContext = createContext<ThemeValue | null>(null)

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
