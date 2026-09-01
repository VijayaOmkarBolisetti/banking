import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, ShieldCheck } from 'lucide-react'
import { applyRoute, ROUTES } from '../../navigation/routes'
import { useAppStore } from '../../store/useAppStore'
import { ADMIN_CREDENTIALS, useAdminStore } from '../../store/useAdminStore'
import type { OnboardingStep } from '../../types'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'

const ADMIN_LINKS = [
  { label: 'Product controls', path: ROUTES.ADMIN_SETTINGS },
  { label: 'Appearance', path: ROUTES.ADMIN_APPEARANCE },
  { label: 'Customers', path: ROUTES.ADMIN_CUSTOMERS },
  { label: 'Loans & EMIs', path: ROUTES.ADMIN_LOANS },
  { label: 'Operations', path: ROUTES.ADMIN_OPERATIONS },
  { label: 'Support', path: ROUTES.ADMIN_SUPPORT },
]

interface DemoLink {
  label: string
  path: string
  seed: OnboardingStep | 'dashboard'
}

const GROUPS: { title: string; links: DemoLink[] }[] = [
  {
    title: 'Onboarding',
    links: [
      { label: 'Splash', path: ROUTES.SPLASH, seed: 'splash' },
      { label: 'Onboarding', path: ROUTES.ONBOARDING, seed: 'onboarding' },
      { label: 'Login', path: ROUTES.LOGIN, seed: 'login' },
      { label: 'OTP', path: ROUTES.OTP, seed: 'otp' },
      { label: 'Profile', path: ROUTES.PROFILE, seed: 'profile' },
      { label: 'PAN', path: ROUTES.PAN, seed: 'pan' },
      { label: 'Address', path: ROUTES.ADDRESS, seed: 'address' },
      { label: 'Bank', path: ROUTES.BANK, seed: 'bank' },
      { label: 'Consent', path: ROUTES.CONSENT, seed: 'consent' },
      { label: 'Eligibility', path: ROUTES.ELIGIBILITY, seed: 'eligibility' },
      { label: 'Approved', path: ROUTES.CREDIT_APPROVED, seed: 'credit_approved' },
    ],
  },
  {
    title: 'Loan products',
    links: [
      { label: 'All products', path: ROUTES.LOAN_PRODUCTS, seed: 'dashboard' },
      { label: 'Personal', path: applyRoute('personal'), seed: 'dashboard' },
      { label: 'Home', path: applyRoute('home'), seed: 'dashboard' },
      { label: 'Business', path: applyRoute('business'), seed: 'dashboard' },
      { label: 'Gold / Vehicle', path: applyRoute('gold'), seed: 'dashboard' },
    ],
  },
  {
    title: 'App',
    links: [
      { label: 'Dashboard', path: ROUTES.DASHBOARD, seed: 'dashboard' },
      { label: 'My loans', path: ROUTES.MY_LOANS, seed: 'dashboard' },
      { label: 'Credit', path: ROUTES.CREDIT, seed: 'dashboard' },
      { label: 'Payments', path: ROUTES.PAYMENTS, seed: 'dashboard' },
      { label: 'Pay now', path: ROUTES.PAY_NOW, seed: 'dashboard' },
      { label: 'Schedule', path: ROUTES.REPAYMENT_SCHEDULE, seed: 'dashboard' },
      { label: 'Transactions', path: ROUTES.TRANSACTIONS, seed: 'dashboard' },
      { label: 'Support', path: ROUTES.SUPPORT, seed: 'dashboard' },
      { label: 'Chat', path: ROUTES.CHAT, seed: 'dashboard' },
      { label: 'Profile', path: ROUTES.PROFILE_HOME, seed: 'dashboard' },
    ],
  },
]

/**
 * Presentation aid: jumps to any screen with the right mock data already
 * seeded, so a client walkthrough never has to sit through the full journey.
 */
export function DemoMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const seedForDemoRoute = useAppStore((state) => state.seedForDemoRoute)
  const resetDemo = useAppStore((state) => state.resetDemo)
  const showToast = useAppStore((state) => state.showToast)
  const adminLogin = useAdminStore((state) => state.login)

  function jump(link: DemoLink) {
    seedForDemoRoute(link.seed)
    setOpen(false)
    navigate(link.path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-4 z-30 flex items-center gap-1.5 rounded-full bg-inverse/90 px-3 py-2.5 text-[10px] font-bold tracking-wide text-inverse-ink uppercase shadow-lg backdrop-blur-sm lg:bottom-6 lg:left-[15rem] xl:left-[17rem]"
        aria-label="Open demo menu"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Demo
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Demo mode">
        <p className="mb-4 text-sm text-muted">
          Jump to any screen for the walkthrough. Everything after login is prefilled with mock data.
        </p>

        <div className="space-y-4">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                {group.title}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.links.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => jump(link)}
                    className="pressable rounded-2xl bg-surface px-3 py-3 text-left text-xs font-semibold text-ink"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2.5 border-t border-line pt-5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            Admin console
          </p>

          {/* Signs the admin in first, so the walkthrough never stalls on a
              login form the presenter has to remember credentials for. */}
          <Button
            size="md"
            onClick={() => {
              adminLogin(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)
              setOpen(false)
              navigate(ROUTES.ADMIN_HOME)
            }}
          >
            <ShieldCheck className="h-4 w-4" />
            Open admin panel
          </Button>

          <div className="grid grid-cols-2 gap-2">
            {ADMIN_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  adminLogin(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)
                  setOpen(false)
                  navigate(link.path)
                }}
                className="pressable rounded-2xl bg-subtle px-3 py-3 text-left text-xs font-semibold text-ink"
              >
                {link.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              resetDemo()
              setOpen(false)
              navigate(ROUTES.SPLASH)
              showToast('Demo data cleared', 'info')
            }}
          >
            Reset demo data
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
