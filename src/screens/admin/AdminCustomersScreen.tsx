import { useEffect, useState, type ReactNode } from 'react'
import { formatInr, maskAccount, maskPan } from '../../lib/format'
import { LottiePlayer } from '../../components/ui/LottiePlayer'
import { useAppStore } from '../../store/useAppStore'

const STEP_LABELS: Record<string, string> = {
  splash: 'Splash',
  onboarding: 'Onboarding',
  login: 'Login',
  otp: 'OTP verified',
  profile: 'Profile',
  pan: 'PAN',
  address: 'Address',
  bank: 'Bank',
  consent: 'Consent',
  eligibility: 'Eligibility',
  credit_approved: 'Credit approved',
  complete: 'Active',
}

export function AdminCustomersScreen() {
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated())
  const profile = useAppStore((state) => state.profile)
  const mobileNumber = useAppStore((state) => state.mobileNumber)
  const pan = useAppStore((state) => state.pan)
  const address = useAppStore((state) => state.address)
  const bank = useAppStore((state) => state.bank)
  const credit = useAppStore((state) => state.credit)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const currentStep = useAppStore((state) => state.currentStep)

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true))
    if (useAppStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    void useAppStore.persist.rehydrate()
    const refresh = () => void useAppStore.persist.rehydrate()
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (!hydrated) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-line/70 bg-card p-10 card-shadow">
        <LottiePlayer name="loading" className="h-32 w-32" />
        <p className="mt-4 text-lg font-bold text-ink">Loading customer data</p>
        <p className="mt-1 text-sm text-muted">Reading saved session from local storage...</p>
      </div>
    )
  }

  const hasProfile = Boolean(profile.fullName || profile.email || profile.dateOfBirth)
  const hasKyc = Boolean(pan.panNumber || bank.bankName)
  const hasAddress = Boolean(address.city || address.pinCode)
  const statusLabel = isAuthenticated ? STEP_LABELS[currentStep] ?? currentStep : 'Not signed in'

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Customers</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">Onboarding status and KYC captured in the customer app.</p>
      <div className="mt-4 rounded-3xl border border-line/70 bg-card p-4 card-shadow sm:mt-6 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-extrabold">{profile.fullName || 'Incomplete profile'}</p>
            <p className="text-sm text-muted">{mobileNumber ? `+91 ${mobileNumber}` : 'No mobile yet'}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
              isAuthenticated ? 'bg-success-soft text-success' : 'bg-subtle text-muted'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {!hasProfile && !hasKyc && !hasAddress && mobileNumber ? (
          <p className="mt-4 rounded-2xl bg-warning-soft px-4 py-3 text-sm text-amber-800">
            Customer signed in but has not completed profile yet. Finish onboarding in the customer app to see full
            details here.
          </p>
        ) : null}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Section title="Profile">
            <Row label="Email" value={profile.email || '—'} />
            <Row label="DOB" value={profile.dateOfBirth || '—'} />
            <Row label="Employment" value={profile.employmentType || '—'} />
            <Row label="Income" value={profile.monthlyIncome ? formatInr(Number(profile.monthlyIncome)) : '—'} />
          </Section>
          <Section title="KYC & bank">
            <Row label="PAN" value={pan.panNumber ? maskPan(pan.panNumber) : '—'} />
            <Row label="PAN status" value={pan.verified ? 'Verified' : 'Pending'} />
            <Row label="Bank" value={bank.bankName || '—'} />
            <Row label="Account" value={bank.accountNumber ? maskAccount(bank.accountNumber) : '—'} />
          </Section>
          <Section title="Address">
            <Row label="City" value={address.city || '—'} />
            <Row label="State" value={address.state || '—'} />
            <Row label="PIN" value={address.pinCode || '—'} />
            <Row label="Residence" value={address.residentialStatus || '—'} />
          </Section>
          <Section title="Credit line">
            <Row label="Limit" value={formatInr(credit.limit)} />
            <Row label="Used" value={formatInr(credit.used)} />
            <Row label="Available" value={formatInr(credit.available)} />
            <Row label="Rate" value={`${credit.interestRate}% p.a.`} />
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 font-bold">{title}</h2>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold capitalize">{value}</span>
    </div>
  )
}
