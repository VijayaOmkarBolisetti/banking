import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: string
}

export function OtpInput({ value, onChange, length = 6, error }: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.padEnd(length, ' ').slice(0, length).split('')

  function focusAt(index: number) {
    inputs.current[index]?.focus()
    inputs.current[index]?.select()
  }

  function update(next: string[]) {
    onChange(next.join('').replace(/\s/g, '').slice(0, length))
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = digits.map((item) => (item === ' ' ? '' : item))
    next[index] = digit
    update(next)
    if (digit && index < length - 1) focusAt(index + 1)
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const next = digits.map((item) => (item === ' ' ? '' : item))
      if (next[index]) {
        next[index] = ''
        update(next)
        return
      }
      if (index > 0) {
        next[index - 1] = ''
        update(next)
        focusAt(index - 1)
      }
    }
    if (event.key === 'ArrowLeft' && index > 0) focusAt(index - 1)
    if (event.key === 'ArrowRight' && index < length - 1) focusAt(index + 1)
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    focusAt(Math.min(pasted.length, length - 1))
  }

  return (
    <div>
      <div className="flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputs.current[index] = node
            }}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit === ' ' ? '' : digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className={`h-14 w-12 rounded-2xl border bg-white text-center text-xl font-bold text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              error
                ? 'border-red-300'
                : 'border-line focus:border-primary focus:shadow-[0_0_0_4px_rgb(238_242_255)]'
            }`}
          />
        ))}
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-danger">{error}</p> : null}
    </div>
  )
}
