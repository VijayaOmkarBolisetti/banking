import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Checkbox } from '../components/ui/Checkbox'
import { Chip, emiTone } from '../components/ui/Chip'
import { Screen } from '../components/layout/Screen'
import { formatDate, formatInr } from '../lib/format'
import { buildRepaymentSchedule, calculateLoan } from '../lib/loanCalculator'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

export function LoanReviewScreen() {
  const navigate = useNavigate()
  const pendingQuote = useAppStore((state) => state.pendingQuote)
  const defaultAmount = useConfigStore((state) => state.defaultAmount)
  const defaultTenure = useConfigStore((state) => state.defaultTenure)
  const firstDueDate = useConfigStore((state) => state.firstDueDate)
  const quote = pendingQuote ?? calculateLoan(defaultAmount, defaultTenure)
  const [agreed, setAgreed] = useState(false)
  const [open, setOpen] = useState(false)
  const schedule = buildRepaymentSchedule(quote, firstDueDate)

  return (
    <Screen
      title="Review loan"
      subtitle="Please review the details before confirming."
      onBack={() => navigate(ROUTES.GET_MONEY)}
      footer={
        <Button disabled={!agreed} onClick={() => navigate(ROUTES.LOAN_PROCESSING)}>
          Accept & Continue
        </Button>
      }
    >
      <Section title="Loan details">
        <Row label="Loan amount" value={formatInr(quote.amount)} />
        <Row label="Tenure" value={`${quote.tenure} months`} />
        <Row label="Interest rate" value={`${quote.interestRate}% p.a.`} />
      </Section>
      <Section title="Charges">
        <Row label="Processing fee" value={formatInr(quote.processingFee)} />
        <Row label="GST" value={formatInr(quote.gst)} />
      </Section>
      <Section title="Disbursal">
        <Row label="Amount requested" value={formatInr(quote.amount)} />
        <Row label="Total charges" value={formatInr(quote.processingFee + quote.gst)} />
        <Row label="Amount you receive" value={formatInr(quote.netAmount)} emphasize />
      </Section>
      <Section title="Repayment">
        <Row label="Monthly EMI" value={formatInr(quote.monthlyEmi)} />
        <Row label="Total repayment" value={formatInr(quote.totalRepayment)} emphasize />
      </Section>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold"
      >
        View repayment schedule
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <Card className="mt-2 space-y-3">
          {schedule.map((emi) => (
            <div key={emi.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">EMI {emi.number}</p>
                <p className="text-xs text-muted">Due: {formatDate(emi.dueDate, 'medium')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatInr(emi.amount)}</p>
                <Chip label="Upcoming" tone={emiTone(emi.status)} />
              </div>
            </div>
          ))}
        </Card>
      ) : null}
      <div className="mt-5">
        <Checkbox
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          label="I have read and agree to the loan agreement and terms."
        />
      </div>
    </Screen>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="mt-3">
      <p className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </Card>
  )
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={emphasize ? 'font-extrabold text-ink' : 'font-semibold'}>{value}</span>
    </div>
  )
}
