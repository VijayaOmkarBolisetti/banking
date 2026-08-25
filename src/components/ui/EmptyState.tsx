import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

/**
 * Uses `bg-card`, not a translucent white — a white overlay renders as a pale
 * grey slab over a dark background and drags the muted body copy down to an
 * unreadable contrast.
 */
export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center rounded-[24px] border border-dashed border-line bg-card px-6 py-10 text-center ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,var(--c-primary-soft),color-mix(in_srgb,var(--c-primary)_18%,transparent))] text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 font-bold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5 w-full max-w-[220px]">{action}</div> : null}
    </motion.div>
  )
}
