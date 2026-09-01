import { useId, type SVGProps } from 'react'

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number
  /** `tile` is the app-icon lockup; `mark` drops the rounded background. */
  variant?: 'tile' | 'mark'
}

/**
 * Bolt Rupee — a ₹ whose descending stem is struck through by a lightning
 * bolt. The two horizontal bars and the bolt read as one glyph at 16px, and
 * the tile picks up the live accent colour so re-theming the app re-themes
 * the brand with it.
 */
export function Logo({ size = 48, variant = 'tile', ...props }: LogoProps) {
  const gradientId = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CreditFlow"
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--c-primary)" />
          <stop offset="100%" stopColor="var(--c-primary-dark)" />
        </linearGradient>
      </defs>

      {variant === 'tile' ? <rect width="48" height="48" rx="13" fill={`url(#${gradientId})`} /> : null}

      {/* The bare mark paints with currentColor so it can sit on any surface —
          including a primary-coloured card, where a fixed accent would vanish. */}
      <g
        stroke={variant === 'tile' ? '#fff' : 'currentColor'}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* The two horizontal bars of ₹ */}
        <path d="M15 15.5H33" />
        <path d="M15 22H33" />
        {/* Left stem, cropped so the bolt reads as its continuation */}
        <path d="M15 15.5c6.5 0 10 1.6 10 6.5" />
      </g>

      {/* Lightning bolt replacing the rupee's descending leg */}
      <path
        d="M27.5 21.5 18 32.5h6.2L20.5 41 31 29.2h-6.4l3.9-7.7Z"
        fill={variant === 'tile' ? '#fff' : 'currentColor'}
      />
    </svg>
  )
}

interface WordmarkProps {
  size?: number
  className?: string
  /** Use on dark/photographic backgrounds where the text must stay white. */
  onDark?: boolean
}

/** Logo plus the CreditFlow name, for headers and nav rails. */
export function Wordmark({ size = 32, className = '', onDark = false }: WordmarkProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} />
      <span className="min-w-0">
        <span
          className={`block truncate text-[15px] leading-tight font-extrabold tracking-tight ${
            onDark ? 'text-white' : 'text-ink'
          }`}
        >
          CreditFlow
        </span>
        <span className={`block text-[10px] leading-tight ${onDark ? 'text-white/70' : 'text-muted'}`}>
          Instant credit, any loan
        </span>
      </span>
    </span>
  )
}
