import type { EmiStatus, TransactionStatus } from '../../types'

interface ChipProps {
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const tones = {
  neutral: 'bg-subtle text-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
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
