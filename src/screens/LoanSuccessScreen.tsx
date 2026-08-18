import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LottiePlayer } from '../components/ui/LottiePlayer'
import { Screen } from '../components/layout/Screen'
import { formatDate, formatInr } from '../lib/format'
import { calculateLoan } from '../lib/loanCalculator'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import { useConfigStore } from '../store/useConfigStore'

export function LoanSuccessScreen() {
  const navigate = useNavigate()
  const loan = useAppStore((state) => state.activeLoan)
  const defaultAmount = useConfigStore((state) => state.defaultAmount)
  const defaultTenure = useConfigStore((state) => state.defaultTenure)
  const firstDueDate = useConfigStore((state) => state.firstDueDate)
  const quote = loan ?? calculateLoan(defaultAmount, defaultTenure)
  const net = quote.netAmount
  const due = loan?.firstDueDate ?? firstDueDate

  return (
    <Screen>
      <div className="flex h-full flex-col items-center pt-6 text-center">
        <LottiePlayer name="success" loop={false} className="h-28 w-28" />
        <motion.div
          className="mt-2"
          initial={{ opacity: 0, transform: 'scale(0.95)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="text-2xl font-extrabold">Success! 🎉</p>
          <p className="mt-5 text-4xl font-extrabold text-primary">{formatInr(net)}</p>
          <p className="mt-2 text-sm text-muted">will be transferred to your bank account.</p>
        </motion.div>
        <Card className="mt-8 w-full text-left">
          <Row label="Loan amount" value={formatInr(quote.amount)} />
          <Row label="Tenure" value={`${quote.tenure} months`} />
          <Row label="Monthly EMI" value={formatInr(quote.monthlyEmi)} />
          <Row label="First payment due" value={formatDate(due)} />
        </Card>
        <div className="mt-auto w-full space-y-3 pt-8">
          <Button onClick={() => navigate(ROUTES.REPAYMENT_SCHEDULE)}>View repayment schedule</Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Back to home
          </Button>
        </div>
      </div>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
