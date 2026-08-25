export function formatInr(amount: number, withSymbol = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
  return withSymbol ? `₹${formatted}` : formatted
}

/** ₹3.5L / ₹1.2Cr — the Indian short forms, for headline figures. */
export function formatInrShort(amount: number): string {
  const value = Math.round(Math.abs(amount))
  const sign = amount < 0 ? '-' : ''
  if (value >= 10_000_000) return `${sign}₹${trimZero(value / 10_000_000)}Cr`
  if (value >= 100_000) return `${sign}₹${trimZero(value / 100_000)}L`
  if (value >= 1_000) return `${sign}₹${trimZero(value / 1_000)}K`
  return `${sign}₹${value}`
}

function trimZero(value: number): string {
  return value.toFixed(value < 10 ? 2 : 1).replace(/\.?0+$/, '')
}

export function formatDate(isoDate: string, style: 'long' | 'medium' | 'short' = 'long'): string {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate

  if (style === 'short') {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  if (style === 'medium') {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '').slice(-10)
  if (digits.length !== 10) return mobile
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

export function maskAccount(accountNumber: string): string {
  if (accountNumber.length < 4) return accountNumber
  return `XXXX${accountNumber.slice(-4)}`
}

export function maskPan(pan: string): string {
  if (pan.length < 4) return pan
  return `${pan.slice(0, 2)}XXXXXX${pan.slice(-2)}`
}

export function greetingFor(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function firstName(fullName: string): string {
  const name = fullName.trim()
  if (!name) return 'there'
  const first = name.split(/\s+/)[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export function addMonths(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setMonth(date.getMonth() + months)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
