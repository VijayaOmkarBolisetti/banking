import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastViewport() {
  const toasts = useAppStore((state) => state.toasts)
  const dismissToast = useAppStore((state) => state.dismissToast)

  return (
    <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top,0px))] right-3 left-3 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.button
              key={toast.id}
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-left text-sm font-medium text-white shadow-lg"
              initial={{ opacity: 0, transform: 'translateY(-12px) scale(0.97)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
              exit={{ opacity: 0, transform: 'translateY(-8px) scale(0.97)' }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <Icon className={`h-4 w-4 ${toast.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`} />
              {toast.message}
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
