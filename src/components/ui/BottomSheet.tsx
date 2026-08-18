import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="absolute inset-0 z-40">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />
          <motion.div
            className="absolute right-0 bottom-0 left-0 max-h-[82%] overflow-auto rounded-t-[28px] bg-white p-5 shadow-[0_-12px_40px_rgb(15_23_42_/_0.18)]"
            initial={{ transform: 'translateY(100%)' }}
            animate={{ transform: 'translateY(0%)' }}
            exit={{ transform: 'translateY(100%)' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            {title ? <h3 className="mb-4 text-lg font-bold text-ink">{title}</h3> : null}
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
