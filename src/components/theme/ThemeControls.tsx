import { Check, Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { ACCENT_PRESETS, useThemeStore, type ThemeMode } from '../../store/useThemeStore'

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
]

/** Segmented light / dark picker. */
export function ThemeModePicker() {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  return (
    <div className="grid grid-cols-2 gap-2">
      {MODES.map((item) => {
        const Icon = item.icon
        const active = mode === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`pressable relative flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-2xl border text-xs font-semibold transition-colors ${
              active ? 'border-primary text-primary' : 'border-line bg-card text-muted'
            }`}
            aria-pressed={active}
          >
            {active ? (
              <motion.span
                layoutId="theme-mode-bg"
                className="absolute inset-0 rounded-2xl bg-primary-soft"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            ) : null}
            <Icon className="relative h-4 w-4" />
            <span className="relative">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Accent swatches plus a native colour input for anything off-palette. */
export function AccentPicker() {
  const accent = useThemeStore((state) => state.accent)
  const setAccent = useThemeStore((state) => state.setAccent)

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {ACCENT_PRESETS.map((preset) => {
          const active = accent.toLowerCase() === preset.value.toLowerCase()
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setAccent(preset.value)}
              title={preset.label}
              aria-label={preset.label}
              aria-pressed={active}
              className="pressable flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-[var(--c-card)] transition-shadow"
              style={{
                background: preset.value,
                boxShadow: active ? `0 0 0 2px var(--c-card), 0 0 0 4px ${preset.value}` : undefined,
              }}
            >
              {active ? <Check className="h-4 w-4 text-white" strokeWidth={3} /> : null}
            </button>
          )
        })}

        <label
          className="pressable relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-line"
          title="Custom colour"
        >
          <span
            className="absolute inset-0"
            style={{
              background:
                'conic-gradient(#ef4444,#f59e0b,#10b981,#06b6d4,#3b82f6,#8b5cf6,#ec4899,#ef4444)',
            }}
          />
          <input
            type="color"
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Custom accent colour"
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-muted">
        Buttons, links, charts and the logo all follow this colour.
      </p>
    </div>
  )
}

/** Compact icon toggle for headers — flips straight between light and dark. */
export function ThemeToggleButton({ className = '' }: { className?: string }) {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)
  const next: ThemeMode = mode === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      className={`pressable relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-muted hover:bg-subtle hover:text-ink ${className}`}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        >
          {mode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
