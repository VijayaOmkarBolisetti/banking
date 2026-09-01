import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { ChatPanel } from './ChatPanel'

/**
 * Floating assistant. On phones it opens as a near-full-height sheet; from
 * tablet up it docks as a panel in the bottom-right of the app shell.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label="Close assistant"
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-40 bg-slate-900/40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            className="absolute right-0 bottom-0 left-0 z-50 overflow-hidden rounded-t-[28px] shadow-[var(--c-shadow-lift)] sm:right-4 sm:bottom-4 sm:left-auto sm:h-[min(560px,calc(100%-2rem))] sm:w-[380px] sm:rounded-[24px] lg:right-6 lg:bottom-6"
            style={{ height: 'min(78%, 620px)' }}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="relative flex h-full flex-col">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="pressable absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-subtle text-muted hover:bg-line"
              >
                <X className="h-4 w-4" />
              </button>
              <ChatPanel className="h-full" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? null : (
          <motion.button
            key="fab"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open assistant"
            className="absolute right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#1e3a8a] text-white shadow-[0_12px_30px_color-mix(in_srgb,var(--c-primary)_45%,transparent)] lg:right-6 lg:bottom-6"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/40"
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <MessageCircle className="relative h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
