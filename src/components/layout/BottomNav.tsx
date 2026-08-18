import { CreditCard, Home, User, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Logo } from '../brand/Logo'
import { ROUTES } from '../../navigation/routes'

export const APP_NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Home', icon: Home },
  { to: ROUTES.CREDIT, label: 'Credit', icon: CreditCard },
  { to: ROUTES.PAYMENTS, label: 'Payments', icon: Wallet },
  { to: ROUTES.PROFILE_HOME, label: 'Profile', icon: User },
] as const

export function SideNav() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex xl:w-64">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <Logo size={36} />
        <div>
          <p className="text-sm font-bold text-ink">CreditFlow</p>
          <p className="text-[11px] text-muted">Your credit account</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {APP_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-slate-50 hover:text-ink'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export function BottomNav() {
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-slate-100 bg-white px-1 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom,0px))] lg:hidden">
      {APP_NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
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
