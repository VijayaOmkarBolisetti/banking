import type { ChangeEvent } from 'react'
import { AnimatedNumber } from './AnimatedNumber'
import { formatInrShort } from '../../lib/format'

interface AmountSliderProps {
  value: number
  min: number
  max: number
  step?: number
  accent?: string
  /** Optional preset amounts rendered as tappable chips below the track. */
  presets?: number[]
  onChange: (value: number) => void
}

export function AmountSlider({
  value,
  min,
  max,
  step = 1000,
  accent = '#3b5bdb',
  presets = [],
  onChange,
}: AmountSliderProps) {
  const span = Math.max(1, max - min)
  const percent = Math.min(100, Math.max(0, ((value - min) / span) * 100))

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value))
  }

  return (
    <div>
      <div className="mb-5 text-center">
        <p className="text-sm font-medium text-muted">Loan amount</p>
        <AnimatedNumber
          value={value}
          className="mt-1 block text-[clamp(1.9rem,8vw,2.6rem)] leading-none font-extrabold tracking-tight text-ink"
        />
      </div>

      <div className="relative">
        <div className="absolute top-[11px] right-0 left-0 h-1.5 rounded-full bg-track" />
        <div
          className="absolute top-[11px] left-0 h-1.5 rounded-full transition-[width] duration-150 ease-out"
          style={{ width: `${percent}%`, background: accent }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative z-10"
          aria-label="Loan amount"
          aria-valuetext={formatInrShort(value)}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs font-medium text-muted">
        <span>{formatInrShort(min)}</span>
        <span>{formatInrShort(max)}</span>
      </div>

      {presets.length > 0 ? (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {presets.map((preset) => {
            const active = value === preset
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className={`pressable shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                  active ? 'border-transparent text-white' : 'border-line bg-card text-muted'
                }`}
                style={active ? { background: accent } : undefined}
              >
                {formatInrShort(preset)}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
