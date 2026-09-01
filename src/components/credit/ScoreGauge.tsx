import { motion } from 'framer-motion'
import { MAX_SCORE, MIN_SCORE, SCORE_BANDS, bandFor } from '../../lib/creditScore'

interface ScoreGaugeProps {
  score: number
  size?: number
  /** Set when the gauge sits on a coloured card and needs white labels. */
  onColor?: boolean
}

/**
 * 240° arc gauge for the CIBIL score. The track is segmented by band so the
 * position reads as "which band am I in", not just a number — which is what
 * actually decides the pre-approved limit.
 */
export function ScoreGauge({ score, size = 180, onColor = false }: ScoreGaugeProps) {
  const stroke = size * 0.085
  const radius = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2

  // 240° sweep, starting at 150° (lower-left) and ending at 30° (lower-right).
  const START = 150
  const SWEEP = 240
  const circumference = 2 * Math.PI * radius
  const arcLength = (SWEEP / 360) * circumference

  const clamped = Math.max(MIN_SCORE, Math.min(MAX_SCORE, score || MIN_SCORE))
  const ratio = score ? (clamped - MIN_SCORE) / (MAX_SCORE - MIN_SCORE) : 0
  const band = bandFor(clamped)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ transform: `rotate(${START - 90}deg)` }}>
        {/* Band segments */}
        {SCORE_BANDS.map((item, index) => {
          const next = SCORE_BANDS[index + 1]
          const from = (item.min - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)
          const to = ((next?.min ?? MAX_SCORE) - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)
          return (
            <circle
              key={item.id}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={item.accent}
              strokeOpacity={onColor ? 0.32 : 0.2}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${arcLength * (to - from)} ${circumference}`}
              strokeDashoffset={-arcLength * from}
            />
          )
        })}

        {/* Achieved arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={onColor ? '#ffffff' : band.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLength * ratio} ${circumference}`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${arcLength * ratio} ${circumference}` }}
          transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-[clamp(1.5rem,${size / 42}rem,2.4rem)] leading-none font-extrabold tabular-nums ${
            onColor ? 'text-white' : 'text-ink'
          }`}
          style={{ fontSize: size * 0.22 }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {score || '—'}
        </motion.span>
        <span
          className={`mt-1 text-[11px] font-bold ${onColor ? 'text-white/75' : 'text-muted'}`}
          style={{ fontSize: Math.max(10, size * 0.075) }}
        >
          {score ? band.label : 'Not checked'}
        </span>
      </div>
    </div>
  )
}
