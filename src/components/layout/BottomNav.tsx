import { CreditCard, Gift, Home, Layers, LifeBuoy, User, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../brand/Logo'
import { ROUTES } from '../../navigation/routes'

/** Four primary destinations — the set that fits a thumb bar. */
export const APP_NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Home', icon: Home },
  { to: ROUTES.MY_LOANS, label: 'Loans', icon: Layers },
  { to: ROUTES.PAYMENTS, label: 'Payments', icon: Wallet },
  { to: ROUTES.REWARDS, label: 'Rewards', icon: Gift },
  { to: ROUTES.PROFILE_HOME, label: 'Profile', icon: User },
] as const

/** Desktop has room for the secondary destinations too. */
const SIDE_NAV_EXTRAS = [
  { to: ROUTES.CREDIT, label: 'Credit', icon: CreditCard },
  { to: ROUTES.SUPPORT, label: 'Support', icon: LifeBuoy },
] as const

export function SideNav() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-card lg:flex xl:w-64">
      <div className="flex items-center gap-3 border-b border-line px-5 py-5">
        <Logo size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">CreditFlow</p>
          <p className="text-[11px] text-muted">Your credit account</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {APP_NAV_ITEMS.map((item) => (
          <SideLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}

        <p className="px-3 pt-5 pb-2 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">More</p>
        {SIDE_NAV_EXTRAS.map((item) => (
          <SideLink key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </nav>
    </aside>
  )
}

function SideLink({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: typeof Home
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
          isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-subtle hover:text-ink'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export function BottomNav() {
  return (
    <nav className="grid shrink-0 grid-cols-5 border-t border-line bg-card px-1 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom,0px))] lg:hidden">
      {APP_NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition-colors ${
                isActive ? 'text-primary' : 'text-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                {item.label}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
