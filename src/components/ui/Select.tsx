import type { SelectHTMLAttributes } from 'react'
import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: readonly Option[]
  error?: string
  placeholder?: string
}

export function Select({
  label,
  options,
  error,
  placeholder = 'Select',
  id,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <label className="block" htmlFor={selectId}>
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <div className="relative">
        <select
          id={selectId}
          className={`h-12 w-full appearance-none rounded-2xl border bg-card px-3.5 pr-10 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            error
              ? 'border-danger/60 shadow-[0_0_0_4px_var(--c-danger-soft)]'
              : 'border-line focus:border-primary focus:shadow-[0_0_0_4px_var(--c-primary-ring)]'
          }`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-faint" />
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
    </label>
  )
}
