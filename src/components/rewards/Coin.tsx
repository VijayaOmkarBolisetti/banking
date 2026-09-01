import { motion } from 'framer-motion'
import { useId } from 'react'

interface CoinProps {
  size?: number
  className?: string
  /** Slow continuous flip, for hero placements. */
  spin?: boolean
}

/**
 * A ₹ coin drawn as SVG rather than an emoji or bitmap, so it stays crisp at
 * every size and picks up the same gold in both themes. The "flip" is an
 * x-scale on the face — cheap, and reads as a real coin turning.
 */
export function Coin({ size = 24, className = '', spin = false }: CoinProps) {
  const id = useId()

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
      animate={spin ? { rotateY: [0, 180, 360] } : undefined}
      transition={spin ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={spin ? { transformStyle: 'preserve-3d' } : undefined}
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      <circle cx="20" cy="20" r="18" fill={`url(#${id}-rim)`} />
      <circle cx="20" cy="20" r="14.5" fill={`url(#${id}-face)`} />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="#92400e" strokeOpacity="0.25" strokeWidth="1" />

      {/* Rupee mark */}
      <g stroke="#7c2d12" strokeWidth="2.1" strokeLinecap="round" strokeOpacity="0.9" fill="none">
        <path d="M15 13.5h10" />
        <path d="M15 17.5h10" />
        <path d="M15 13.5c5 0 7 1 7 4s-2 4-7 4h1l7 6.5" />
      </g>

      {/* Specular sweep */}
      <path d="M9 12c2.5-4 7-6.5 11-6.5" stroke="#fffbeb" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
  )
}

/**
 * Celebration burst shown after coins are earned. Purely decorative and
 * unmounted by the parent once it finishes.
 */
export function CoinBurst({ count = 10 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {Array.from({ length: count }, (_, index) => {
        // Deterministic spread — no Math.random, so renders stay stable.
        const angle = (index / count) * Math.PI * 2
        const distance = 70 + (index % 3) * 26
        return (
          <motion.span
            key={index}
            className="absolute"
            initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.4, 1, 1, 0.6],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 20,
            }}
            transition={{ duration: 1.1, delay: index * 0.04, ease: 'easeOut' }}
          >
            <Coin size={18} />
          </motion.span>
        )
      })}
    </div>
  )
}
