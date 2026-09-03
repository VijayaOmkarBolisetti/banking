import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Screen } from '../components/layout/Screen'
import { HELP_TOPICS, PRIVACY_TEXT, TERMS_TEXT } from '../mock/data'
import { formatDate, formatInr, maskAccount, maskPan } from '../lib/format'
import { useAppStore } from '../store/useAppStore'
import { formatContactHour, useRulesStore } from '../store/useRulesStore'

export function ProfilePersonalScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.profile)
  return (
    <Screen title="Personal information" onBack={() => navigate(-1)}>
      <Card className="mt-3 space-y-3 text-sm">
        <Row label="Full name" value={profile.fullName || 'Vijay Sharma'} />
        <Row label="Date of birth" value={profile.dateOfBirth ? formatDate(profile.dateOfBirth) : '12 April 1996'} />
        <Row label="Gender" value={profile.gender || 'Male'} />
        <Row label="Email" value={profile.email || 'vijay.sharma@email.com'} />
        <Row label="Employment" value={profile.employmentType || 'Salaried'} />
        <Row label="Monthly income" value={formatInr(Number(profile.monthlyIncome || 85000))} />
      </Card>
    </Screen>
  )
}

export function ProfileBankScreen() {
  const navigate = useNavigate()
  const bank = useAppStore((state) => state.bank)
  return (
    <Screen title="Bank account" onBack={() => navigate(-1)}>
      <Card className="mt-3 space-y-3 text-sm">
        <Row label="Account holder" value={bank.accountHolderName || 'Vijay Sharma'} />
        <Row label="Bank" value={bank.bankName || 'HDFC Bank'} />
        <Row label="Account" value={bank.accountNumber ? maskAccount(bank.accountNumber) : 'XXXX4567'} />
        <Row label="IFSC" value={bank.ifscCode || 'HDFC0001234'} />
        <Row label="Status" value={bank.verified ? 'Verified' : 'Pending'} />
      </Card>
    </Screen>
  )
}

export function ProfileDocumentsScreen() {
  const navigate = useNavigate()
  const pan = useAppStore((state) => state.pan)
  return (
    <Screen title="Documents" onBack={() => navigate(-1)}>
      <Card className="mt-3 space-y-3 text-sm">
        <Row label="PAN" value={pan.panNumber ? maskPan(pan.panNumber) : 'ABCDE1234F'} />
        <Row label="PAN status" value={pan.verified ? 'Verified' : 'Not verified'} />
        <Row label="Selfie" value="Verified" />
        <Row label="Address proof" value="Verified" />
      </Card>
      <p className="mt-4 text-xs text-muted">Your documents are stored securely with your profile.</p>
    </Screen>
  )
}

export function ProfileNotificationsScreen() {
  const navigate = useNavigate()
  const consent = useAppStore((state) => state.consent)
  const setPermission = useAppStore((state) => state.setPermission)
  return (
    <Screen title="Notifications" onBack={() => navigate(-1)}>
      <Card className="mt-3">
        <Toggle
          label="Push notifications"
          on={consent.notifications === 'granted'}
          onToggle={() => setPermission('notifications', consent.notifications === 'granted' ? 'not_now' : 'granted')}
        />
      </Card>
    </Screen>
  )
}

export function ProfileSecurityScreen() {
  const navigate = useNavigate()
  return (
    <Screen title="Security" onBack={() => navigate(-1)}>
      <Card className="mt-3 space-y-3 text-sm">
        <Row label="App lock" value="On" />
        <Row label="Biometrics" value="On" />
        <Row label="Last login" value="Just now" />
      </Card>
    </Screen>
  )
}

export function ProfileHelpScreen() {
  const navigate = useNavigate()
  const rules = useRulesStore()

  return (
    <Screen title="Help & support" onBack={() => navigate(-1)}>
      <div className="mt-3 space-y-3">
        <Card>
          <p className="font-semibold">What if my EMI bounces?</p>
          <p className="mt-1 text-sm text-muted">
            You get {rules.gracePeriodDays} days grace after the due date. After that a bounce fee of{' '}
            {formatInr(rules.bounceFeeFlat)} and a late fee of {rules.lateFeePercent}% of the EMI may
            apply
            {rules.maxPenaltyPercentOfEmi > 0
              ? ` (capped at ${rules.maxPenaltyPercentOfEmi}% of EMI)`
              : ''}
            . New draws from your credit line pause from day {rules.blockDrawFromDpd} overdue.
          </p>
        </Card>
        <Card>
          <p className="font-semibold">When will recovery contact me?</p>
          <p className="mt-1 text-sm text-muted">
            Soft reminders from day {rules.softReminderFromDpd}, call centre from day{' '}
            {rules.callCentreFromDpd}, field agents from day {rules.fieldAgentFromDpd} (max{' '}
            {rules.maxAgentVisitsPerWeek}/week), and legal notice from day {rules.legalNoticeFromDpd}.
            Agents contact only between {formatContactHour(rules.agentContactFromHour)} and{' '}
            {formatContactHour(rules.agentContactToHour)}.
          </p>
        </Card>
        {HELP_TOPICS.map((topic) => (
          <Card key={topic.id}>
            <p className="font-semibold">{topic.title}</p>
            <p className="mt-1 text-sm text-muted">{topic.body}</p>
          </Card>
        ))}
      </div>
    </Screen>
  )
}

export function ProfileTermsScreen() {
  const navigate = useNavigate()
  const rules = useRulesStore()

  return (
    <Screen title="Terms & Conditions" onBack={() => navigate(-1)}>
      <Card className="mt-3">
        <p className="text-sm leading-6 text-muted whitespace-pre-line">{TERMS_TEXT}</p>
      </Card>
      <Card className="mt-3">
        <p className="font-semibold text-ink">Collection, bounce &amp; recovery</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Grace period: {rules.gracePeriodDays} day(s). Bounce fee: {formatInr(rules.bounceFeeFlat)}.
          Late fee: {rules.lateFeePercent}% of EMI
          {rules.maxPenaltyPercentOfEmi > 0
            ? `, capped at ${rules.maxPenaltyPercentOfEmi}% of EMI`
            : ''}
          . Soft reminder from DPD {rules.softReminderFromDpd}; call centre from DPD{' '}
          {rules.callCentreFromDpd}; field recovery from DPD {rules.fieldAgentFromDpd} (up to{' '}
          {rules.maxAgentVisitsPerWeek} visit(s) per week); legal notice from DPD{' '}
          {rules.legalNoticeFromDpd}. Credit draws may be blocked from DPD {rules.blockDrawFromDpd}.
          Agent contact window: {formatContactHour(rules.agentContactFromHour)}–
          {formatContactHour(rules.agentContactToHour)}. Foreclosure fee:{' '}
          {rules.foreclosureFeePercent}% of outstanding principal.
          {rules.allowPartPayment ? ' Part-payment of EMI is permitted.' : ''}
        </p>
      </Card>
    </Screen>
  )
}

export function ProfilePrivacyScreen() {
  const navigate = useNavigate()
  return (
    <Screen title="Privacy Policy" onBack={() => navigate(-1)}>
      <Card className="mt-3">
        <p className="text-sm leading-6 text-muted whitespace-pre-line">{PRIVACY_TEXT}</p>
      </Card>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="max-w-[60%] text-right font-semibold capitalize">{value}</span>
    </div>
  )
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between">
      <span className="text-sm font-semibold">{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 ${on ? 'bg-primary' : 'bg-track'}`}>
        <span className={`block h-4 w-4 rounded-full bg-card transition-transform duration-150 ${on ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}
