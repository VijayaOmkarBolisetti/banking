interface SegmentedControlProps<T extends string | number> {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  /** Overrides the active pill colour so it can track the loan product. */
  accent?: string
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  accent,
}: SegmentedControlProps<T>) {
  const columns =
    options.length <= 2
      ? 'grid-cols-2'
      : options.length === 3
        ? 'grid-cols-3'
        : options.length === 4
          ? 'grid-cols-4'
          : options.length === 5
            ? 'grid-cols-5'
            : 'grid-cols-3 sm:grid-cols-6'

  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`pressable min-h-11 rounded-2xl px-2 text-xs font-semibold transition-colors sm:text-sm ${
              active ? 'text-white shadow-md' : 'bg-card text-muted'
            }`}
            style={active ? { background: accent ?? 'var(--color-primary)' } : undefined}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
