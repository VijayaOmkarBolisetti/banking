import { Briefcase, Gem, House, Wallet, Zap, type LucideIcon } from 'lucide-react'
import type { LoanProduct } from '../../types'

const ICONS: Record<LoanProduct['icon'], LucideIcon> = {
  zap: Zap,
  wallet: Wallet,
  home: House,
  briefcase: Briefcase,
  gem: Gem,
}

export function productIcon(key: LoanProduct['icon']): LucideIcon {
  return ICONS[key] ?? Wallet
}

interface ProductIconProps {
  product: LoanProduct
  className?: string
  iconClassName?: string
}

export function ProductIcon({
  product,
  className = 'h-11 w-11 rounded-2xl',
  iconClassName = 'h-5 w-5',
}: ProductIconProps) {
  const Icon = productIcon(product.icon)
  return (
    <span
      className={`flex shrink-0 items-center justify-center text-white ${className}`}
      style={{ background: product.accent }}
    >
      <Icon className={iconClassName} />
    </span>
  )
}
