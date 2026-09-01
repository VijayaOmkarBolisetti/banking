import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
}

export function Checkbox({ label, checked, className = '', id, ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label htmlFor={inputId} className={`flex cursor-pointer items-start gap-3 ${className}`}>
      <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <span className="flex h-5 w-5 items-center justify-center rounded-md border border-line bg-card transition-[background-color,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:shadow-[0_0_0_4px_var(--c-primary-ring)]">
          {checked ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
        </span>
      </span>
      <span className="text-sm leading-5 text-muted">{label}</span>
    </label>
  )
}
