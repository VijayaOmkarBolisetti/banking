import { useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Screen } from '../components/layout/Screen'
import { AccentPicker, ThemeModePicker } from '../components/theme/ThemeControls'
import { Logo } from '../components/brand/Logo'
import { formatInr } from '../lib/format'
import { useThemeStore } from '../store/useThemeStore'
import { useAppStore } from '../store/useAppStore'

export function AppearanceScreen() {
  const navigate = useNavigate()
  const resetTheme = useThemeStore((state) => state.resetTheme)
  const credit = useAppStore((state) => state.credit)
  const showToast = useAppStore((state) => state.showToast)

  return (
    <Screen title="Appearance" subtitle="Theme and accent colour." onBack={() => navigate(-1)}>
      <Card className="mt-3">
        <p className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">Theme</p>
        <ThemeModePicker />
        <p className="mt-3 text-xs text-muted">
          Your choice is remembered on this device.
        </p>
      </Card>

      <Card className="mt-3">
        <p className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">Accent colour</p>
        <AccentPicker />
      </Card>

      {/* Live preview so the effect of a change is visible without leaving. */}
      <Card className="mt-3">
        <p className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">Preview</p>
        <div className="rounded-[20px] bg-gradient-to-br from-primary to-primary-dark p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] tracking-wide text-white/70 uppercase">Available credit</p>
              <p className="mt-1 truncate text-2xl font-extrabold">{formatInr(credit.available)}</p>
            </div>
            <Logo size={36} variant="mark" className="shrink-0 text-white" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
            Accent chip
          </span>
          <span className="rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
            Paid
          </span>
          <span className="rounded-full bg-warning-soft px-3 py-1.5 text-xs font-bold text-warning">
            Upcoming
          </span>
          <span className="rounded-full bg-danger-soft px-3 py-1.5 text-xs font-bold text-danger">
            Overdue
          </span>
        </div>
        <div className="mt-4">
          <Button size="md">Primary button</Button>
        </div>
      </Card>

      <div className="mt-4 pb-2">
        <Button
          variant="secondary"
          size="md"
          onClick={() => {
            resetTheme()
            showToast('Appearance reset to defaults', 'info')
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </Button>
      </div>
    </Screen>
  )
}
