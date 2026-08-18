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

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-[0_8px_20px_rgb(59_91_219_/_0.28)] disabled:bg-slate-300 disabled:shadow-none',
  secondary: 'bg-primary-soft text-primary disabled:text-slate-400',
  ghost: 'bg-transparent text-ink disabled:text-slate-400',
  danger: 'bg-red-50 text-danger',
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
