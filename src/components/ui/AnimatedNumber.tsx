import { useEffect, useRef, useState } from 'react'
import { formatInr } from '../../lib/format'

interface AnimatedNumberProps {
  value: number
  /** Formatter applied to each frame; defaults to Indian rupee formatting. */
  format?: (value: number) => string
  durationMs?: number
  className?: string
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Counts from the previously rendered value to the next one. Money that ticks
 * up reads as a change the user caused, rather than a number that just swapped.
 */
export function AnimatedNumber({
  value,
  format = formatInr,
  durationMs = 700,
  className = '',
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const from = fromRef.current
    if (from === value || prefersReducedMotion()) {
      fromRef.current = value
      setDisplay(value)
      return undefined
    }

    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      // easeOutCubic keeps the last third slow enough to read.
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      fromRef.current = value
    }
  }, [value, durationMs])

  return (
    <span className={className} aria-live="polite">
      {format(display)}
    </span>
  )
}
