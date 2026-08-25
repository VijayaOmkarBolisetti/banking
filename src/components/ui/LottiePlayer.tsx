import type { AnimationItem } from 'lottie-web'
import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type LottieName = 'loading' | 'success'

interface LottiePlayerProps {
  name: LottieName
  className?: string
  loop?: boolean
}

export function LottiePlayer({ name, className = 'h-28 w-28', loop = true }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const [ready, setReady] = useState(false)

  // lottie-web plus the animation JSON is ~250KB — far too much to ship in the
  // initial bundle for a spinner, so both load on demand. The CSS ring below
  // covers the gap, which is usually a single frame.
  useEffect(() => {
    if (name !== 'loading') return undefined
    let cancelled = false

    void Promise.all([import('lottie-web'), import('../../assets/lottie/loading.json')]).then(
      ([lottieModule, animationModule]) => {
        const container = containerRef.current
        if (cancelled || !container) return

        animationRef.current?.destroy()
        animationRef.current = lottieModule.default.loadAnimation({
          container,
          renderer: 'svg',
          loop,
          autoplay: true,
          animationData: animationModule.default,
        })
        setReady(true)
      },
    )

    return () => {
      cancelled = true
      animationRef.current?.destroy()
      animationRef.current = null
      setReady(false)
    }
  }, [name, loop])

  if (name === 'success') {
    return <SuccessMark className={className} />
  }

  return (
    <div ref={containerRef} className={`lottie-player ${className}`} role="img" aria-label="Loading">
      {ready ? null : (
        <span className="h-1/3 w-1/3 animate-spin rounded-full border-[3px] border-line border-t-primary" />
      )}
    </div>
  )
}

/**
 * Spring-scaled badge with a stroke-drawn tick. Reads far crisper than a GIF
 * at any density, and the checkmark draws itself rather than popping in.
 */
export function SuccessMark({ className = 'h-28 w-28' }: { className?: string }) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      role="img"
      aria-label="Success"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-emerald-400/30"
        animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_12px_30px_color-mix(in_srgb,var(--c-success)_38%,transparent)]">
        <svg viewBox="0 0 48 48" className="h-1/2 w-1/2" fill="none" aria-hidden>
          <motion.path
            d="M12 25.5 L20.5 34 L36 15"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
          />
        </svg>
      </span>
    </motion.div>
  )
}

/** Small inline tick for list rows. */
export function InlineCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return <Check className={className} strokeWidth={3} />
}
