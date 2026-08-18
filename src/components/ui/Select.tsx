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
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      <div className="relative">
        <select
          id={selectId}
          className={`h-12 w-full appearance-none rounded-2xl border bg-white px-3.5 pr-10 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            error
              ? 'border-red-300 shadow-[0_0_0_4px_rgb(254_226_226)]'
              : 'border-line focus:border-primary focus:shadow-[0_0_0_4px_rgb(238_242_255)]'
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
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
    </label>
  )
}
