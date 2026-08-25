import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Coin } from './Coin'
import { ROUTES } from '../../navigation/routes'
import { useAppStore } from '../../store/useAppStore'

/**
 * Header pill showing the coin balance. When the balance rises it briefly
 * flashes the delta, so earning coins is visible from wherever you are in the
 * app rather than only on the rewards screen.
 */
export function CoinBalance({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const coins = useAppStore((state) => state.coins)
  const previous = useRef(coins)
  const [delta, setDelta] = useState<number | null>(null)

  useEffect(() => {
    const gained = coins - previous.current
    previous.current = coins
    if (gained <= 0) return undefined

    setDelta(gained)
    const timer = window.setTimeout(() => setDelta(null), 2200)
    return () => window.clearTimeout(timer)
  }, [coins])

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.REWARDS)}
      className={`pressable relative flex shrink-0 items-center gap-1.5 rounded-full border border-warning/25 bg-warning-soft py-1.5 pr-3 pl-1.5 ${className}`}
      aria-label={`${coins} Flow Coins. Open rewards`}
    >
      <motion.span
        animate={delta ? { rotate: [0, -18, 18, 0], scale: [1, 1.25, 1] } : undefined}
        transition={{ duration: 0.6 }}
      >
        <Coin size={20} />
      </motion.span>
      <span className="text-xs font-extrabold text-warning tabular-nums">
        {coins.toLocaleString('en-IN')}
      </span>

      <AnimatePresence>
        {delta ? (
          <motion.span
            className="absolute -top-2 left-1/2 rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm"
            initial={{ opacity: 0, y: 6, x: '-50%' }}
            animate={{ opacity: 1, y: -6, x: '-50%' }}
            exit={{ opacity: 0, y: -14, x: '-50%' }}
            transition={{ duration: 0.35 }}
          >
            +{delta}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  )
}
