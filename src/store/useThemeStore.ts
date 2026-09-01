import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandSyncStorage } from '../lib/storage'

export type ThemeMode = 'light' | 'dark'

/** Preset accents offered in the admin panel and the profile picker. */
export const ACCENT_PRESETS = [
  { id: 'indigo', label: 'Indigo', value: '#3b5bdb' },
  { id: 'violet', label: 'Violet', value: '#7c3aed' },
  { id: 'teal', label: 'Teal', value: '#0d9488' },
  { id: 'emerald', label: 'Emerald', value: '#059669' },
  { id: 'amber', label: 'Amber', value: '#d97706' },
  { id: 'rose', label: 'Rose', value: '#e11d48' },
  { id: 'slate', label: 'Graphite', value: '#334155' },
] as const

export const DEFAULT_ACCENT = ACCENT_PRESETS[0].value

interface ThemeStore {
  mode: ThemeMode
  accent: string
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: string) => void
  resetTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // Light is the default so a demo always opens the same way, whatever
      // the presenting machine's OS is set to. "System" stays available.
      mode: 'light',
      accent: DEFAULT_ACCENT,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      resetTheme: () => set({ mode: 'light', accent: DEFAULT_ACCENT }),
    }),
    {
      name: 'creditflow-theme',
      storage: createJSONStorage(() => zustandSyncStorage),
      partialize: (state) => ({ mode: state.mode, accent: state.accent }),
    },
  ),
)

/**
 * Writes the current theme onto <html>. The mode is always explicit, so the
 * device setting never overrides what the user picked.
 */
export function applyTheme(mode: ThemeMode, accent: string) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', mode)
  root.style.setProperty('--c-accent', accent)
}

export function isDarkActive(mode: ThemeMode): boolean {
  return mode === 'dark'
}
