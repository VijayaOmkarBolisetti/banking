import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  className = '',
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      <div
        className={`flex items-center gap-2 rounded-2xl border bg-white px-3.5 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          error
            ? 'border-red-300 shadow-[0_0_0_4px_rgb(254_226_226)]'
            : 'border-line focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgb(238_242_255)]'
        } ${className}`}
      >
        {prefix ? <span className="shrink-0 text-sm font-semibold text-slate-500">{prefix}</span> : null}
        <input
          id={inputId}
          className="h-12 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-slate-400"
          {...props}
        />
        {suffix ? <span className="shrink-0 text-slate-400">{suffix}</span> : null}
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
      {!error && hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </label>
  )
}
