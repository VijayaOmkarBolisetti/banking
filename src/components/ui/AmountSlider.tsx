import type { ChangeEvent } from 'react'
import { formatInr } from '../../lib/format'

interface AmountSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}

export function AmountSlider({ value, min, max, step = 1000, onChange }: AmountSliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value))
  }

  return (
    <div>
      <div className="mb-5 text-center">
        <p className="text-sm font-medium text-muted">Requested amount</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink">{formatInr(value)}</p>
      </div>
      <div className="relative">
        <div className="absolute top-[11px] right-0 left-0 h-1.5 rounded-full bg-slate-200" />
        <div
          className="absolute top-[11px] left-0 h-1.5 rounded-full bg-primary"
          style={{ width: `${percent}%` }}
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
        />
      </div>
      <div className="mt-2 flex justify-between text-xs font-medium text-muted">
        <span>{formatInr(min)}</span>
        <span>{formatInr(max)}</span>
      </div>
    </div>
  )
}
