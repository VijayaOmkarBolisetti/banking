interface SegmentedControlProps<T extends string | number> {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className={`grid gap-2 ${options.length <= 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`pressable min-h-11 rounded-2xl px-2 text-xs font-semibold sm:text-sm ${
              active ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-600'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
