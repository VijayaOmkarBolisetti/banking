import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

interface TabPageProps {
  children: ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function TabPage({ children, title, subtitle, className = '' }: TabPageProps) {
  return (
    <div className={`h-full overflow-y-auto bg-surface px-4 pt-4 pb-8 lg:px-8 lg:pt-6 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 lg:mb-6">
          <h1 className="text-[22px] font-extrabold text-ink lg:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </header>
        {children}
      </div>
    </div>
  )
}

interface ScreenProps {
  children: ReactNode
  title?: string
  subtitle?: string
  onBack?: () => void
  right?: ReactNode
  footer?: ReactNode
  className?: string
  wide?: boolean
}

export function Screen({
  children,
  title,
  subtitle,
  onBack,
  right,
  footer,
  className = '',
  wide = false,
}: ScreenProps) {
  const hasHeader = Boolean(title || onBack || right)
  const rows = hasHeader
    ? footer
      ? 'grid-rows-[auto_minmax(0,1fr)_auto]'
      : 'grid-rows-[auto_minmax(0,1fr)]'
    : footer
      ? 'grid-rows-[minmax(0,1fr)_auto]'
      : 'grid-rows-[minmax(0,1fr)]'

  return (
    <div className={`grid h-full min-h-0 overflow-hidden bg-surface ${rows} ${className}`}>
      {hasHeader ? (
        <header className="flex shrink-0 items-start gap-3 px-5 pt-4 pb-2 lg:px-8 lg:pt-6">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="pressable mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            {title ? <h1 className="text-[22px] leading-7 font-extrabold text-ink lg:text-3xl">{title}</h1> : null}
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          {right}
        </header>
      ) : null}
      <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-4 lg:px-8">
        <div className={`mx-auto w-full ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>{children}</div>
      </div>
      {footer ? (
        <div className="screen-footer z-20 shrink-0 border-t border-slate-100 bg-white px-5 pt-3 lg:px-8">
          <div className={`mx-auto w-full ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>{footer}</div>
        </div>
      ) : null}
    </div>
  )
}
