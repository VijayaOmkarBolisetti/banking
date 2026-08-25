import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SuccessMark } from '../components/ui/LottiePlayer'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { Screen } from '../components/layout/Screen'
import { EmptyState } from '../components/ui/EmptyState'
import { ProductIcon } from '../components/loans/ProductIcon'
import { formatDate, formatInr } from '../lib/format'
import { formatTenure, getProduct } from '../lib/loanProducts'
import { ROUTES } from '../navigation/routes'
import { selectOpenLoans, useAppStore } from '../store/useAppStore'
import { Wallet } from 'lucide-react'

/** Confetti-free celebration: staggered reveal keeps it feeling premium. */
const reveal = {
  hidden: { opacity: 0, y: 12 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + index * 0.09, duration: 0.4, ease: [0.23, 1, 0.32, 1] as const },
  }),
}

export function LoanSuccessScreen() {
  const navigate = useNavigate()
  const loans = useAppStore((state) => state.loans)
  const loan = selectOpenLoans({ loans })[0] ?? loans[0] ?? null

  if (!loan) {
    return (
      <Screen title="All done">
        <EmptyState
          className="mt-6"
          icon={Wallet}
          title="No loan to show"
          description="Once a loan is disbursed its summary appears here."
          action={<Button onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>Browse loans</Button>}
        />
      </Screen>
    )
  }

  const product = getProduct(loan.productId)

  return (
    <Screen>
      <div className="flex min-h-full flex-col items-center pt-6 pb-4 text-center">
        <SuccessMark className="h-24 w-24" />

        <motion.div custom={0} variants={reveal} initial="hidden" animate="show" className="mt-4">
          <p className="text-2xl font-extrabold text-ink">{product.name} approved</p>
          <p className="mt-1 text-sm text-muted">Transferring to your linked bank account</p>
        </motion.div>

        <motion.div custom={1} variants={reveal} initial="hidden" animate="show" className="mt-6">
          <AnimatedNumber
            value={loan.netAmount}
            durationMs={1100}
            className="block text-[clamp(2.2rem,10vw,3rem)] leading-none font-extrabold"
            format={(value) => formatInr(value)}
          />
          <p className="mt-2 text-xs tracking-wide text-muted uppercase">Net disbursal</p>
        </motion.div>

        <motion.div custom={2} variants={reveal} initial="hidden" animate="show" className="mt-7 w-full">
          <Card className="text-left">
            <div className="mb-3 flex items-center gap-3 border-b border-line pb-3">
              <ProductIcon product={product} className="h-9 w-9 rounded-xl" iconClassName="h-4 w-4" />
              <p className="text-sm font-bold text-ink">{product.name}</p>
            </div>
            <Row label="Loan amount" value={formatInr(loan.amount)} />
            <Row label="Tenure" value={formatTenure(loan.tenure)} />
            <Row label="Interest rate" value={`${loan.interestRate}% p.a.`} />
            <Row label="Monthly EMI" value={formatInr(loan.monthlyEmi)} />
            <Row label="First payment due" value={formatDate(loan.firstDueDate)} />
          </Card>
        </motion.div>

        <motion.div
          custom={3}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="mt-auto w-full space-y-3 pt-8"
        >
          <Button onClick={() => navigate(ROUTES.REPAYMENT_SCHEDULE)} style={{ background: product.accent }}>
            View repayment schedule
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Back to home
          </Button>
        </motion.div>
      </div>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  )
}
