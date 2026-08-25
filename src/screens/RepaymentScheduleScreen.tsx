import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip, emiTone } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Screen } from '../components/layout/Screen'
import { ProductIcon } from '../components/loans/ProductIcon'
import { formatDate, formatInr } from '../lib/format'
import { repaymentProgress } from '../lib/loanCalculator'
import { formatTenure, getProduct } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

export function RepaymentScheduleScreen() {
  const navigate = useNavigate()
  const loans = useAppStore((state) => state.loans)
  const [activeId, setActiveId] = useState(() => loans.find((loan) => !loan.closed)?.id ?? loans[0]?.id)

  const loan = loans.find((item) => item.id === activeId) ?? loans[0] ?? null

  if (!loan) {
    return (
      <Screen title="Repayment schedule" onBack={() => navigate(-1)}>
        <EmptyState
          className="mt-6"
          icon={CalendarDays}
          title="No schedule yet"
          description="Once you take a loan, every instalment and its due date shows up here."
          action={<Button onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>Browse loans</Button>}
        />
      </Screen>
    )
  }

  const product = getProduct(loan.productId)
  const paid = loan.emis.filter((emi) => emi.status === 'paid').length
  const progress = repaymentProgress(paid, loan.tenure)
  const remaining = (loan.tenure - paid) * loan.monthlyEmi

  return (
    <Screen
      title="Repayment schedule"
      subtitle={`${product.name} · ${formatTenure(loan.tenure)}`}
      onBack={() => navigate(-1)}
      wide
      footer={
        loan.closed ? (
          <Button variant="secondary" onClick={() => navigate(ROUTES.MY_LOANS)}>
            Back to my loans
          </Button>
        ) : (
          <Button onClick={() => navigate(ROUTES.PAY_NOW)} style={{ background: product.accent }}>
            Pay next EMI
          </Button>
        )
      }
    >
      {loans.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {loans.map((item) => {
            const itemProduct = getProduct(item.productId)
            const active = item.id === loan.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`pressable shrink-0 rounded-full px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  active ? 'text-white' : 'bg-card text-muted'
                }`}
                style={active ? { background: itemProduct.accent } : undefined}
              >
                {itemProduct.shortName}
              </button>
            )
          })}
        </div>
      ) : null}

      <Card className="mt-3" padding="lg">
        <div className="flex items-center gap-3">
          <ProductIcon product={product} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{product.name}</p>
            <p className="text-xs text-muted">
              {formatInr(loan.amount)} at {loan.interestRate}% p.a.
            </p>
          </div>
          <Chip label={loan.closed ? 'Closed' : 'Active'} tone={loan.closed ? 'neutral' : 'success'} />
        </div>
        <div className="mt-4">
          <ProgressBar value={progress} tone={loan.closed ? 'success' : 'primary'} />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted">
              {paid} of {loan.tenure} EMIs paid
            </span>
            <span className="font-semibold text-ink">{formatInr(remaining)} remaining</span>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid gap-2.5 pb-2 lg:grid-cols-2">
        {loan.emis.map((emi, index) => (
          <motion.div
            key={emi.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: Math.min(index, 12) * 0.03 }}
          >
            <Card className="flex items-center justify-between gap-3" padding="sm">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    emi.status === 'paid'
                      ? 'bg-success-soft text-success'
                      : emi.status === 'overdue'
                        ? 'bg-danger-soft text-danger'
                        : 'bg-subtle text-muted'
                  }`}
                >
                  {emi.number}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{formatInr(emi.amount)}</p>
                  <p className="text-xs text-muted">Due {formatDate(emi.dueDate, 'medium')}</p>
                </div>
              </div>
              <Chip
                label={emi.status === 'paid' ? 'Paid' : emi.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                tone={emiTone(emi.status)}
              />
            </Card>
          </motion.div>
        ))}
      </div>
    </Screen>
  )
}
