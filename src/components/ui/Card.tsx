import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
}

const paddings = {
  sm: 'p-3.5',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({ children, className = '', padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={`rounded-[22px] border border-white bg-white shadow-[0_10px_30px_rgb(15_23_42_/_0.06)] ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
