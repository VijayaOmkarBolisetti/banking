import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Plus, Wallet } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { TabPage } from '../components/layout/Screen'
import { ProductIcon } from '../components/loans/ProductIcon'
import { formatDate, formatInr } from '../lib/format'
import { repaymentProgress } from '../lib/loanCalculator'
import { formatTenure, getProduct } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import { selectMonthlyOutflow, selectTotalOutstanding, useAppStore } from '../store/useAppStore'
import type { ActiveLoan } from '../types'

type Filter = 'active' | 'closed'

export function MyLoansScreen() {
  const navigate = useNavigate()
  const loans = useAppStore((state) => state.loans)
  const [filter, setFilter] = useState<Filter>('active')

  const active = loans.filter((loan) => !loan.closed)
  const closed = loans.filter((loan) => loan.closed)
  const shown = filter === 'active' ? active : closed

  const outstanding = selectTotalOutstanding({ loans })
  const monthly = selectMonthlyOutflow({ loans })

  return (
    <TabPage title="My loans" subtitle="Every loan you hold with CreditFlow.">
      <div className="mb-4 sm:max-w-xs">
        <Button onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>
          <Plus className="h-4 w-4" />
          Apply for a new loan
        </Button>
      </div>

      {loans.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 lg:max-w-md">
          <Card className="grad-card" padding="md">
            <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Outstanding</p>
            <p className="mt-1 truncate text-xl font-extrabold text-ink">{formatInr(outstanding)}</p>
          </Card>
          <Card className="grad-card" padding="md">
            <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Monthly EMIs</p>
            <p className="mt-1 truncate text-xl font-extrabold text-ink">{formatInr(monthly)}</p>
          </Card>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        {(['active', 'closed'] as Filter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`pressable rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              filter === item ? 'bg-primary text-white' : 'bg-card text-muted'
            }`}
          >
            {item} ({item === 'active' ? active.length : closed.length})
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 pb-2 lg:grid-cols-2 2xl:grid-cols-3">
        {shown.map((loan, index) => (
          <LoanRow key={loan.id} loan={loan} index={index} onOpen={() => navigate(ROUTES.REPAYMENT_SCHEDULE)} />
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={filter === 'active' ? Wallet : CheckCircle2}
          title={filter === 'active' ? 'No active loans' : 'No closed loans yet'}
          description={
            filter === 'active'
              ? 'Apply for a personal, home, business or gold loan and it will show up here.'
              : 'Loans you fully repay move here so you keep the history.'
          }
          action={
            filter === 'active' ? (
              <Button size="md" onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>
                Browse loans
              </Button>
            ) : undefined
          }
        />
      ) : null}
    </TabPage>
  )
}

function LoanRow({ loan, index, onOpen }: { loan: ActiveLoan; index: number; onOpen: () => void }) {
  const product = getProduct(loan.productId)
  const paid = loan.emis.filter((emi) => emi.status === 'paid').length
  const next = loan.emis.find((emi) => emi.status !== 'paid')
  const progress = repaymentProgress(paid, loan.tenure)

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="lift w-full rounded-[22px] border border-card bg-card p-4 text-left card-shadow"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex items-start gap-3">
        <ProductIcon product={product} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{product.name}</p>
          <p className="text-xs text-muted">
            {formatInr(loan.amount)} · {formatTenure(loan.tenure)} · {loan.interestRate}%
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
          <span className="font-semibold text-ink">{progress}%</span>
        </div>
      </div>

      {next ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface px-3 py-2.5">
          <span className="text-xs text-muted">Next due {formatDate(next.dueDate, 'medium')}</span>
          <span className="text-sm font-bold text-ink">{formatInr(next.amount)}</span>
        </div>
      ) : null}
    </motion.button>
  )
}
