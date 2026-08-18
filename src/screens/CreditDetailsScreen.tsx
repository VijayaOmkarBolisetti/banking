import { useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Screen } from '../components/layout/Screen'
import { formatDate, formatInr } from '../lib/format'
import { repaymentProgress, utilizationPercent } from '../lib/loanCalculator'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

export function CreditDetailsScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const credit = useAppStore((state) => state.credit)
  const loan = useAppStore((state) => state.activeLoan)
  const used = utilizationPercent(credit.used, credit.limit)
  const paid = loan?.emis.filter((emi) => emi.status === 'paid').length ?? 0
  const total = loan?.tenure ?? 0
  const isTab = location.pathname === ROUTES.CREDIT

  return (
    <Screen
      title="Credit details"
      subtitle="Your CreditFlow limit and current usage."
      onBack={isTab ? undefined : () => navigate(-1)}
      wide={isTab}
    >
      <div className={isTab ? 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-5' : undefined}>
        <div>
          <Card className="mt-3 bg-gradient-to-br from-primary to-[#1e3a8a] text-white" padding="lg">
            <p className="text-sm text-indigo-100">Total Credit Limit</p>
            <p className="text-[clamp(1.75rem,6vw,2.25rem)] font-extrabold">{formatInr(credit.limit)}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Mini label="Used Credit" value={formatInr(credit.used)} />
              <Mini label="Available Credit" value={formatInr(credit.available)} />
            </div>
          </Card>
          <Card className="mt-4">
            <p className="text-sm font-semibold">Credit utilization</p>
            <div className="mt-3 rounded-full bg-slate-100">
              <div className="px-1 py-1">
                <ProgressBar value={used} />
              </div>
            </div>
            <p className="mt-2 text-sm font-bold text-primary">{used}%</p>
          </Card>
        </div>

        <div>
          <Card className={`space-y-3 text-sm ${isTab ? 'mt-3 lg:mt-3' : 'mt-4'}`}>
            <Row label="Interest rate" value={`${credit.interestRate}% p.a.`} />
            <Row label="Active loan" value={loan ? formatInr(loan.amount) : 'None'} />
            <Row label="Tenure" value={loan ? `${loan.tenure} months` : '—'} />
            <Row label="Monthly EMI" value={loan ? formatInr(loan.monthlyEmi) : '—'} />
            <Row label="Next due" value={loan ? formatDate(loan.firstDueDate) : '—'} />
          </Card>
          {loan ? (
            <Card className="mt-4">
              <p className="text-sm font-semibold">Repayment progress</p>
              <div className="mt-3 rounded-full bg-slate-100 p-1">
                <ProgressBar value={repaymentProgress(paid, total)} tone="success" />
              </div>
              <p className="mt-2 text-sm text-muted">
                {paid} of {total} EMIs paid
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </Screen>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-xs text-indigo-100">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
