import { Monitor, RotateCcw, Smartphone } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { AccentPicker, ThemeModePicker } from '../../components/theme/ThemeControls'
import { Logo, Wordmark } from '../../components/brand/Logo'
import { ProductIcon } from '../../components/loans/ProductIcon'
import { formatInr } from '../../lib/format'
import { LOAN_PRODUCTS } from '../../lib/loanProducts'
import { ACCENT_PRESETS, useThemeStore } from '../../store/useThemeStore'
import { useAppStore } from '../../store/useAppStore'
import { logOperation } from '../../store/useAdminStore'

/**
 * Branding controls. The theme store is shared with the customer app, so
 * anything changed here re-themes both consoles live in the same browser.
 */
export function AdminAppearanceScreen() {
  const mode = useThemeStore((state) => state.mode)
  const accent = useThemeStore((state) => state.accent)
  const resetTheme = useThemeStore((state) => state.resetTheme)
  const credit = useAppStore((state) => state.credit)
  const showToast = useAppStore((state) => state.showToast)

  const presetName =
    ACCENT_PRESETS.find((p) => p.value.toLowerCase() === accent.toLowerCase())?.label ?? 'Custom'

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Appearance</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">
        Theme and brand colour for both the customer app and this console.
      </p>

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6 rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
          <div>
            <h2 className="font-bold text-ink">Theme</h2>
            <p className="mt-1 mb-3 text-sm text-muted">
              Currently <span className="font-semibold text-ink">{mode}</span>.
            </p>
            <ThemeModePicker />
          </div>

          <div>
            <h2 className="font-bold text-ink">Brand colour</h2>
            <p className="mt-1 mb-3 text-sm text-muted">
              Currently <span className="font-semibold text-ink">{presetName}</span> ({accent}).
            </p>
            <AccentPicker />
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
            <Button
              fullWidth={false}
              className="px-5 sm:w-auto"
              onClick={() => {
                logOperation('admin', 'settings', 'Appearance updated', `${mode} · ${accent}`)
                showToast('Appearance saved for this browser', 'success')
              }}
            >
              Save appearance
            </Button>
            <Button
              variant="secondary"
              fullWidth={false}
              className="px-5 sm:w-auto"
              onClick={() => {
                resetTheme()
                logOperation('admin', 'settings', 'Appearance reset', 'Restored default theme')
                showToast('Appearance reset', 'info')
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
            <h2 className="flex items-center gap-2 font-bold text-ink">
              <Smartphone className="h-4 w-4 text-primary" />
              Customer app preview
            </h2>

            <div className="mt-4 rounded-[22px] bg-surface p-4">
              <div className="rounded-[18px] bg-gradient-to-br from-primary to-primary-dark p-4 text-white">
                <p className="text-[10px] tracking-[0.16em] text-white/70 uppercase">
                  Pre-approved limit
                </p>
                <p className="mt-1.5 text-2xl font-extrabold">{formatInr(credit.limit)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/12 px-2.5 py-2">
                    <p className="text-[10px] text-white/70">Available</p>
                    <p className="truncate text-sm font-bold">{formatInr(credit.available)}</p>
                  </div>
                  <div className="rounded-xl bg-white/12 px-2.5 py-2">
                    <p className="text-[10px] text-white/70">Used</p>
                    <p className="truncate text-sm font-bold">{formatInr(credit.used)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {LOAN_PRODUCTS.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-card px-1 py-2.5"
                  >
                    <ProductIcon
                      product={product}
                      className="h-7 w-7 rounded-lg"
                      iconClassName="h-3.5 w-3.5"
                    />
                    <span className="truncate text-[9px] font-bold text-ink">
                      {product.shortName}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Next EMI</span>
                  <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning">
                    Upcoming
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-2.5 h-9 w-full rounded-xl bg-primary text-xs font-bold text-white"
                >
                  Pay now
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
            <h2 className="flex items-center gap-2 font-bold text-ink">
              <Monitor className="h-4 w-4 text-primary" />
              Logo
            </h2>
            <p className="mt-1 text-sm text-muted">
              The mark inherits the brand colour automatically.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div className="text-center">
                <Logo size={56} />
                <p className="mt-2 text-[10px] text-muted">Tile</p>
              </div>
              <div className="text-center">
                <Logo size={56} variant="mark" className="text-primary" />
                <p className="mt-2 text-[10px] text-muted">Mark</p>
              </div>
              <div className="text-center">
                <Logo size={24} />
                <p className="mt-2 text-[10px] text-muted">Favicon</p>
              </div>
              <div>
                <Wordmark size={40} />
                <p className="mt-2 text-[10px] text-muted">Wordmark</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
