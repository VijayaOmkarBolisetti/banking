import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

/**
 * The primary button carries a subtle accent gradient rather than a flat fill —
 * it reads as the one thing to press without needing a louder colour. The
 * gradient is derived from the live accent, so it re-themes with everything else.
 */
const variants: Record<Variant, string> = {
  primary:
    'bg-[linear-gradient(135deg,var(--c-primary),var(--c-primary-dark))] text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--c-primary)_32%,transparent)] disabled:bg-none disabled:bg-line disabled:text-faint disabled:shadow-none',
  secondary: 'bg-primary-soft text-primary disabled:text-faint',
  ghost: 'bg-transparent text-ink disabled:text-faint',
  danger: 'bg-danger-soft text-danger',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-12 px-4 text-[15px]',
  lg: 'h-14 px-5 text-base',
}

export function Button({
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`pressable inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-[transform,background-color,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
      {children}
    </button>
  )
}
