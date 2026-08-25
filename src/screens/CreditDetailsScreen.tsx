import { useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { ProgressBar } from '../components/ui/ProgressBar'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { Screen } from '../components/layout/Screen'
import { ProductIcon } from '../components/loans/ProductIcon'
import { ScoreGauge } from '../components/credit/ScoreGauge'
import { formatDate, formatInr } from '../lib/format'
import { bandFor, nextBandFor } from '../lib/creditScore'
import { repaymentProgress, utilizationPercent } from '../lib/loanCalculator'
import { formatTenure, getProduct } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import {
  selectMonthlyOutflow,
  selectNextEmi,
  selectOpenLoans,
  selectTotalOutstanding,
  useAppStore,
} from '../store/useAppStore'

export function CreditDetailsScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const credit = useAppStore((state) => state.credit)
  const loans = useAppStore((state) => state.loans)
  const creditScore = useAppStore((state) => state.creditScore)

  const used = utilizationPercent(credit.used, credit.limit)
  const openLoans = selectOpenLoans({ loans })
  const outstanding = selectTotalOutstanding({ loans })
  const monthly = selectMonthlyOutflow({ loans })
  const next = selectNextEmi({ loans })
  const isTab = location.pathname === ROUTES.CREDIT

  return (
    <Screen
      title="Credit"
      subtitle="Your limit, utilisation and everything you owe."
      onBack={isTab ? undefined : () => navigate(-1)}
      wide
    >
      <div className="mt-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
        <div>
          <Card className="bg-gradient-to-br from-primary to-[#1e3a8a] text-white" padding="lg">
            <p className="text-sm text-indigo-100">Total credit limit</p>
            <AnimatedNumber
              value={credit.limit}
              className="mt-1 block text-[clamp(1.75rem,6vw,2.25rem)] font-extrabold"
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Mini label="Used" value={credit.used} />
              <Mini label="Available" value={credit.available} />
            </div>
            <div className="mt-5">
              <ProgressBar value={used} tone="onColor" track="light" />
              <p className="mt-2 text-[11px] text-indigo-100">{used}% utilised</p>
            </div>
          </Card>

          {/* CIBIL — the thing that actually sets the limit above */}
          <Card className="mt-4">
            <p className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">CIBIL score</p>
            <div className="flex items-center gap-4">
              <ScoreGauge score={creditScore.score} size={128} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{bandFor(creditScore.score).label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{bandFor(creditScore.score).blurb}</p>
                {nextBandFor(creditScore.score) ? (
                  <p className="mt-2 text-xs font-semibold text-primary">
                    {nextBandFor(creditScore.score)!.min - creditScore.score} points to{' '}
                    {formatInr(nextBandFor(creditScore.score)!.limit)}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-subtle px-3.5 py-2.5 text-[11px] leading-5 text-muted">
              Every EMI paid on time nudges your score up, and a higher band raises your
              pre-approved limit automatically.
            </p>
          </Card>

          <Card className="mt-4 space-y-3 text-sm">
            <Row label="CIBIL score" value={creditScore.score ? String(creditScore.score) : 'Not checked'} />
            <Row label="Interest rate (line)" value={`${credit.interestRate}% p.a.`} />
            <Row label="Active loans" value={String(openLoans.length)} />
            <Row label="Total outstanding" value={formatInr(outstanding)} />
            <Row label="Monthly EMIs" value={formatInr(monthly)} />
            <Row
              label="Next payment"
              value={next ? `${formatInr(next.amount)} · ${formatDate(next.dueDate, 'medium')}` : '—'}
            />
          </Card>
        </div>

        <div className="mt-4 lg:mt-0">
          <h2 className="mb-3 font-bold text-ink">Loan breakdown</h2>
          {openLoans.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="font-semibold text-ink">No active loans</p>
              <p className="mt-1 text-sm text-muted">Your whole limit is available to draw.</p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {openLoans.map((loan) => {
                const product = getProduct(loan.productId)
                const paid = loan.emis.filter((emi) => emi.status === 'paid').length
                const progress = repaymentProgress(paid, loan.tenure)
                return (
                  <Card key={loan.id}>
                    <div className="flex items-center gap-3">
                      <ProductIcon product={product} className="h-10 w-10 rounded-2xl" iconClassName="h-4 w-4" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{product.name}</p>
                        <p className="text-xs text-muted">
                          {formatInr(loan.amount)} · {formatTenure(loan.tenure)} · {loan.interestRate}%
                        </p>
                      </div>
                      <Chip label={`${progress}%`} tone="info" />
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={progress} tone="success" />
                      <p className="mt-2 text-xs text-muted">
                        {paid} of {loan.tenure} EMIs paid · {formatInr(loan.monthlyEmi)}/mo
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Screen>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 p-3">
      <p className="text-xs text-indigo-100">{label}</p>
      <AnimatedNumber value={value} className="mt-1 block truncate text-lg font-bold" />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  )
}
