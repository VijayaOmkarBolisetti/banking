import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { ROUTES } from '../../navigation/routes'
import { useAppStore } from '../../store/useAppStore'
import type { OnboardingStep } from '../../types'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'

interface DemoLink {
  label: string
  path: string
  seed: OnboardingStep | 'dashboard'
}

const LINKS: DemoLink[] = [
  { label: 'Splash', path: ROUTES.SPLASH, seed: 'splash' },
  { label: 'Onboarding', path: ROUTES.ONBOARDING, seed: 'onboarding' },
  { label: 'Login', path: ROUTES.LOGIN, seed: 'login' },
  { label: 'OTP', path: ROUTES.OTP, seed: 'otp' },
  { label: 'Profile', path: ROUTES.PROFILE, seed: 'profile' },
  { label: 'PAN Verification', path: ROUTES.PAN, seed: 'pan' },
  { label: 'Address', path: ROUTES.ADDRESS, seed: 'address' },
  { label: 'Bank Verification', path: ROUTES.BANK, seed: 'bank' },
  { label: 'Consent', path: ROUTES.CONSENT, seed: 'consent' },
  { label: 'Eligibility', path: ROUTES.ELIGIBILITY, seed: 'eligibility' },
  { label: 'Credit Approved', path: ROUTES.CREDIT_APPROVED, seed: 'credit_approved' },
  { label: 'Dashboard', path: ROUTES.DASHBOARD, seed: 'dashboard' },
  { label: 'Get Money', path: ROUTES.GET_MONEY, seed: 'dashboard' },
  { label: 'Loan Review', path: ROUTES.LOAN_REVIEW, seed: 'dashboard' },
  { label: 'Processing', path: ROUTES.LOAN_PROCESSING, seed: 'dashboard' },
  { label: 'Success', path: ROUTES.LOAN_SUCCESS, seed: 'dashboard' },
  { label: 'Repayment Schedule', path: ROUTES.REPAYMENT_SCHEDULE, seed: 'dashboard' },
  { label: 'Pay Now', path: ROUTES.PAY_NOW, seed: 'dashboard' },
  { label: 'Transactions', path: ROUTES.TRANSACTIONS, seed: 'dashboard' },
  { label: 'Credit Details', path: ROUTES.CREDIT_DETAILS, seed: 'dashboard' },
  { label: 'Profile', path: ROUTES.PROFILE_HOME, seed: 'dashboard' },
]

export function DemoMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const seedForDemoRoute = useAppStore((state) => state.seedForDemoRoute)
  const resetDemo = useAppStore((state) => state.resetDemo)
  const showToast = useAppStore((state) => state.showToast)

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
        className="pressable absolute top-[42%] left-2 z-30 flex items-center gap-1.5 rounded-full bg-ink/90 px-2.5 py-2 text-[10px] font-bold tracking-wide text-white uppercase shadow-lg"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Demo
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Demo mode">
        <p className="mb-4 text-sm text-muted">
          Jump to any screen for the client walkthrough. Screens after login are prefilled with mock data.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {LINKS.map((link) => (
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
        <div className="mt-4">
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
