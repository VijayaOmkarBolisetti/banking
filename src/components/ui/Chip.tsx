import type { EmiStatus, TransactionStatus } from '../../types'

interface ChipProps {
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const tones = {
  neutral: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger: 'bg-red-50 text-danger',
  info: 'bg-primary-soft text-primary',
}

export function Chip({ label, tone = 'neutral' }: ChipProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {label}
    </span>
  )
}

export function emiTone(status: EmiStatus): ChipProps['tone'] {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'danger'
  return 'warning'
}

export function txnTone(status: TransactionStatus): ChipProps['tone'] {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'danger'
  return 'warning'
}
