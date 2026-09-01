import { useNavigate } from 'react-router-dom'
import { CalendarDays, History, Layers, Wallet } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip, emiTone } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { TabPage } from '../components/layout/Screen'
import { ProductIcon } from '../components/loans/ProductIcon'
import { formatDate, formatInr } from '../lib/format'
import { getProduct } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import {
  selectMonthlyOutflow,
  selectNextEmi,
  selectOpenLoans,
  selectTotalOutstanding,
  useAppStore,
} from '../store/useAppStore'

const shortcuts = [
  { label: 'Schedule', hint: 'Every EMI', to: ROUTES.REPAYMENT_SCHEDULE, icon: CalendarDays },
  { label: 'My loans', hint: 'All products', to: ROUTES.MY_LOANS, icon: Layers },
  { label: 'History', hint: 'Credits & charges', to: ROUTES.TRANSACTIONS, icon: History },
]

export function PaymentsTabScreen() {
  const navigate = useNavigate()
  const loans = useAppStore((state) => state.loans)

  const next = selectNextEmi({ loans })
  const openLoans = selectOpenLoans({ loans })
  const outstanding = selectTotalOutstanding({ loans })
  const monthly = selectMonthlyOutflow({ loans })

  return (
    <TabPage title="Payments" subtitle="Manage EMIs across every loan you hold.">
      <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-6">
        <div>
          {next ? (
            <Card padding="lg">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Amount due</p>
              <p className="mt-1 text-[clamp(1.75rem,6vw,2.25rem)] font-extrabold text-ink">
                {formatInr(next.amount)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm text-muted">
                  {next.loan.productName} · {formatDate(next.dueDate)}
                </p>
                <Chip
                  label={next.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                  tone={emiTone(next.status)}
                />
              </div>
              <div className="mt-4">
                <Button onClick={() => navigate(ROUTES.PAY_NOW)}>Pay now</Button>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={Wallet}
              title="Nothing due"
              description="All your instalments are settled. Apply for a new loan whenever you need one."
              action={
                <Button size="md" onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>
                  Browse loans
                </Button>
              }
            />
          )}

          {openLoans.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Card className="grad-card" padding="md">
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Outstanding</p>
                <p className="mt-1 truncate text-xl font-extrabold text-ink">{formatInr(outstanding)}</p>
              </Card>
              <Card className="grad-card" padding="md">
                <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Per month</p>
                <p className="mt-1 truncate text-xl font-extrabold text-ink">{formatInr(monthly)}</p>
              </Card>
            </div>
          ) : null}
        </div>

        <div className="mt-4 lg:mt-0">
          {/* Equal-height tiles: the label sits on a fixed baseline so a
              two-line hint can't shove one tile's text out of line. */}
          <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-1 lg:gap-2.5">
            {shortcuts.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="pressable card-shadow flex h-full min-h-[104px] flex-col items-center justify-center gap-2 rounded-[20px] border border-line/70 bg-card px-2 py-3 text-center lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3.5 lg:text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(140deg,var(--c-primary-soft),color-mix(in_srgb,var(--c-primary)_18%,transparent))] text-primary lg:h-10 lg:w-10">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-ink lg:text-sm">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted lg:text-xs">
                      {item.hint}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {openLoans.length > 0 ? (
            <div className="mt-5">
              <h2 className="font-bold text-ink">Loans in repayment</h2>
              <div className="mt-3 space-y-2">
                {openLoans.map((loan) => {
                  const product = getProduct(loan.productId)
                  const paid = loan.emis.filter((emi) => emi.status === 'paid').length
                  return (
                    <Card key={loan.id} className="flex items-center gap-3" padding="sm">
                      <ProductIcon product={product} className="h-10 w-10 rounded-2xl" iconClassName="h-4 w-4" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
                        <p className="text-xs text-muted">
                          {paid}/{loan.tenure} paid
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-ink">{formatInr(loan.monthlyEmi)}</p>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </TabPage>
  )
}
