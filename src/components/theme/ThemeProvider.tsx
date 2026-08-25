import { useEffect, type ReactNode } from 'react'
import { applyTheme, isDarkActive, useThemeStore } from '../../store/useThemeStore'

/**
 * Applies the persisted theme to <html>. The app offers light and dark only —
 * there is no device-following mode, so the appearance never changes on its
 * own part-way through a walkthrough.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((state) => state.mode)
  const accent = useThemeStore((state) => state.accent)

  useEffect(() => {
    applyTheme(mode, accent)
  }, [mode, accent])

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', isDarkActive(mode) ? '#0b1220' : accent)
  }, [mode, accent])

  return <>{children}</>
}

/** Branch on the resolved theme from a component. */
export function useIsDark(): boolean {
  return useThemeStore((state) => state.mode) === 'dark'
}
