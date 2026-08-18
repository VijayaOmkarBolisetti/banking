import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Smartphone,
  Users,
  X,
} from 'lucide-react'
import { Logo } from '../../components/brand/Logo'
import { ToastViewport } from '../../components/ui/ToastViewport'
import { ROUTES } from '../../navigation/routes'
import { logOperation, useAdminStore } from '../../store/useAdminStore'

const links = [
  { to: ROUTES.ADMIN_HOME, label: 'Overview', icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_SETTINGS, label: 'Product controls', icon: Settings, end: false },
  { to: ROUTES.ADMIN_OPERATIONS, label: 'Operations', icon: Activity, end: false },
  { to: ROUTES.ADMIN_CUSTOMERS, label: 'Customers', icon: Users, end: false },
  { to: ROUTES.ADMIN_LOANS, label: 'Loans & EMIs', icon: CreditCard, end: false },
]

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.ADMIN_HOME]: 'Overview',
  [ROUTES.ADMIN_SETTINGS]: 'Product controls',
  [ROUTES.ADMIN_OPERATIONS]: 'Operations',
  [ROUTES.ADMIN_CUSTOMERS]: 'Customers',
  [ROUTES.ADMIN_LOANS]: 'Loans & EMIs',
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminAuthenticated = useAdminStore((state) => state.isAdminAuthenticated)
  const adminEmail = useAdminStore((state) => state.adminEmail)
  const logout = useAdminStore((state) => state.logout)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  if (!isAdminAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin'

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="admin-stage relative">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col bg-ink text-white transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <p className="text-sm font-bold">CreditFlow</p>
              <p className="text-[11px] text-slate-400">Admin console</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="space-y-2 px-3 pb-5">
          <a
            href={ROUTES.DASHBOARD}
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <Smartphone className="h-4 w-4 shrink-0" />
            Open customer app
          </a>
          <button
            type="button"
            onClick={() => {
              logOperation('admin', 'admin', 'Admin signed out', adminEmail)
              logout()
              navigate(ROUTES.ADMIN_LOGIN)
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
          <p className="truncate px-3 text-[11px] text-slate-500">{adminEmail}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-xl p-2 text-ink hover:bg-slate-100"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{pageTitle}</p>
            <p className="text-[11px] text-muted">CreditFlow Admin</p>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ToastViewport />
    </div>
  )
}
