interface ProgressBarProps {
  value: number
  /** `onColor` is a white fill, for bars sitting on a coloured/gradient card. */
  tone?: 'primary' | 'success' | 'warning' | 'onColor'
  track?: 'light' | 'dark'
}

const tones = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  onColor: 'bg-white',
}

export function ProgressBar({ value, tone = 'primary', track = 'dark' }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value))
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full ${
        track === 'light' ? 'bg-white/25' : 'bg-track'
      }`}
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${tones[tone]} transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
