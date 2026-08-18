import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  Lock,
  LogOut,
  Shield,
  User,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { TabPage } from '../components/layout/Screen'
import { maskAccount, maskPan } from '../lib/format'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

const rows = [
  { label: 'Personal Information', to: ROUTES.PROFILE_PERSONAL, icon: User },
  { label: 'Bank Account', to: ROUTES.PROFILE_BANK, icon: CreditCard },
  { label: 'Documents', to: ROUTES.PROFILE_DOCUMENTS, icon: FileText },
  { label: 'Notifications', to: ROUTES.PROFILE_NOTIFICATIONS, icon: Bell },
  { label: 'Security', to: ROUTES.PROFILE_SECURITY, icon: Lock },
  { label: 'Help & Support', to: ROUTES.PROFILE_HELP, icon: CircleHelp },
  { label: 'Terms & Conditions', to: ROUTES.PROFILE_TERMS, icon: Shield },
  { label: 'Privacy Policy', to: ROUTES.PROFILE_PRIVACY, icon: Shield },
]

export function ProfileHomeScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.profile)
  const pan = useAppStore((state) => state.pan)
  const bank = useAppStore((state) => state.bank)
  const logout = useAppStore((state) => state.logout)
  const showToast = useAppStore((state) => state.showToast)

  return (
    <TabPage title="Profile" subtitle="Account settings and support.">
      <div className="lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-6">
        <Card className="flex items-center gap-3 lg:p-6" padding="md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white lg:h-16 lg:w-16 lg:text-xl">
            {(profile.fullName || 'V').slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold lg:text-xl">{profile.fullName || 'Vijay Sharma'}</p>
            <p className="mt-1 text-xs text-muted lg:text-sm">
              {pan.verified ? `PAN ${maskPan(pan.panNumber)}` : 'PAN not verified'}
            </p>
            <p className="text-xs text-muted lg:text-sm">
              {bank.verified ? maskAccount(bank.accountNumber) : 'Bank not linked'}
            </p>
          </div>
        </Card>

        <div className="mt-4 overflow-hidden rounded-[22px] bg-white shadow-sm lg:mt-0 xl:grid xl:grid-cols-2 xl:gap-px xl:rounded-[24px] xl:bg-slate-100">
          {rows.map((row, index) => {
            const Icon = row.icon
            return (
              <button
                key={row.label}
                type="button"
                onClick={() => navigate(row.to)}
                className={`pressable flex w-full items-center gap-3 bg-white px-4 py-3.5 text-left lg:px-5 lg:py-4 ${
                  index > 0 ? 'border-t border-slate-100 xl:border-t-0' : ''
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex-1 text-sm font-semibold">{row.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          logout()
          showToast('Signed out', 'info')
          navigate(ROUTES.LOGIN)
        }}
        className="pressable mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3.5 text-sm font-bold text-danger lg:mt-6 lg:max-w-xs"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </TabPage>
  )
}
