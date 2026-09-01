import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-3.5',
  md: 'p-4',
  lg: 'p-5',
}

/**
 * The page background and the card are only a few percent apart in
 * lightness, so a hairline border does the separating — the shadow alone
 * leaves cards reading as flat blobs.
 */
export function Card({ children, className = '', padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={`card-shadow rounded-[20px] border border-line/70 bg-card ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
