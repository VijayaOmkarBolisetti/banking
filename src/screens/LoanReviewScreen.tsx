import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Checkbox } from '../components/ui/Checkbox'
import { Screen } from '../components/layout/Screen'
import { ProductIcon } from '../components/loans/ProductIcon'
import { formatDate, formatInr } from '../lib/format'
import { buildAmortisation } from '../lib/loanCalculator'
import { formatTenure, getProduct } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

export function LoanReviewScreen() {
  const navigate = useNavigate()
  const pendingQuote = useAppStore((state) => state.pendingQuote)
  const firstDueDate = useConfigStore((state) => state.firstDueDate)
  const [agreed, setAgreed] = useState(false)
  const [open, setOpen] = useState(false)

  // Nothing to review without a quote — send the customer back to pick one.
  if (!pendingQuote) {
    return (
      <Screen
        title="Review loan"
        onBack={() => navigate(ROUTES.LOAN_PRODUCTS)}
        footer={<Button onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>Choose a loan</Button>}
      >
        <Card className="mt-4 py-8 text-center">
          <p className="font-semibold text-ink">No application in progress</p>
          <p className="mt-1 text-sm text-muted">Pick a product to get a quote.</p>
        </Card>
      </Screen>
    )
  }

  const quote = pendingQuote
  const product = getProduct(quote.productId)
  const schedule = buildAmortisation(quote, firstDueDate)

  return (
    <Screen
      title="Review & accept"
      subtitle="Check the numbers before you confirm."
      onBack={() => navigate(`${ROUTES.LOAN_PRODUCTS}/${product.id}`)}
      wide
      footer={
        <Button
          disabled={!agreed}
          onClick={() => navigate(ROUTES.LOAN_PROCESSING)}
          style={agreed ? { background: product.accent } : undefined}
        >
          Accept & continue
        </Button>
      }
    >
      <Card className="mt-3 flex items-center gap-3" padding="md">
        <ProductIcon product={product} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{product.name}</p>
          <p className="text-xs text-muted">
            {formatInr(quote.amount)} · {formatTenure(quote.tenure)} · {quote.interestRate}% p.a.
          </p>
        </div>
      </Card>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
        <div>
          <Section title="Loan details">
            <Row label="Loan amount" value={formatInr(quote.amount)} />
            <Row label="Tenure" value={formatTenure(quote.tenure)} />
            <Row label="Interest rate" value={`${quote.interestRate}% p.a.`} />
            <Row label="First EMI due" value={formatDate(firstDueDate)} />
          </Section>

          <Section title="Charges">
            <Row label="Processing fee" value={formatInr(quote.processingFee)} />
            <Row label="GST on fee" value={formatInr(quote.gst)} />
            <Row label="Total charges" value={formatInr(quote.processingFee + quote.gst)} />
          </Section>
        </div>

        <div>
          <Section title="Disbursal">
            <Row label="Amount requested" value={formatInr(quote.amount)} />
            <Row label="Less charges" value={`− ${formatInr(quote.processingFee + quote.gst)}`} />
            <Row label="You receive" value={formatInr(quote.netAmount)} emphasize />
          </Section>

          <Section title="Repayment">
            <Row label="Monthly EMI" value={formatInr(quote.monthlyEmi)} />
            <Row label="Total interest" value={formatInr(quote.totalInterest)} />
            <Row label="Total repayment" value={formatInr(quote.totalRepayment)} emphasize />
          </Section>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pressable mt-4 flex w-full items-center justify-between rounded-2xl border border-line/70 bg-card px-4 py-3.5 text-sm font-semibold card-shadow"
        aria-expanded={open}
      >
        Amortisation schedule ({quote.tenure} instalments)
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <Card className="mt-2 overflow-hidden" padding="sm">
              <div className="thin-scroll max-h-80 overflow-y-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="sticky top-0 bg-card">
                    <tr className="text-[11px] font-bold tracking-wide text-muted uppercase">
                      <th className="py-2 pr-2">#</th>
                      <th className="py-2 pr-2">Due</th>
                      <th className="py-2 pr-2 text-right">Principal</th>
                      <th className="py-2 pr-2 text-right">Interest</th>
                      <th className="py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.number} className="border-t border-line">
                        <td className="py-2 pr-2 font-semibold">{row.number}</td>
                        <td className="py-2 pr-2 whitespace-nowrap text-muted">
                          {formatDate(row.dueDate, 'short')}
                        </td>
                        <td className="py-2 pr-2 text-right">{formatInr(row.principal)}</td>
                        <td className="py-2 pr-2 text-right text-muted">{formatInr(row.interest)}</td>
                        <td className="py-2 text-right font-semibold">{formatInr(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-5 pb-2">
        <Checkbox
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          label={`I have read and agree to the ${product.name} agreement, the charges above and the repayment schedule.`}
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
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className={emphasize ? 'font-extrabold text-ink' : 'font-semibold text-ink'}>{value}</span>
    </div>
  )
}
