import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, CalendarCheck, CreditCard, Smartphone } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SuccessMark } from '../components/ui/LottiePlayer'
import { EmptyState } from '../components/ui/EmptyState'
import { ProcessingLoader } from '../components/ui/ProcessingLoader'
import { Screen } from '../components/layout/Screen'
import { ProductIcon } from '../components/loans/ProductIcon'
import { formatDate, formatInr } from '../lib/format'
import { getProduct, productGradient } from '../lib/loanProducts'
import { paymentService } from '../services/paymentService'
import { ROUTES } from '../navigation/routes'
import { selectNextEmi, useAppStore } from '../store/useAppStore'
import { formatContactHour, useRulesStore } from '../store/useRulesStore'
import type { PaymentMethod } from '../types'

const METHODS: { id: PaymentMethod; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'debit_card', label: 'Debit Card', hint: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'net_banking', label: 'Net Banking', hint: 'All major Indian banks', icon: Building2 },
]

export function PayNowScreen() {
  const navigate = useNavigate()
  const loans = useAppStore((state) => state.loans)
  const applyEmiPayment = useAppStore((state) => state.applyEmiPayment)
  const showToast = useAppStore((state) => state.showToast)

  const next = selectNextEmi({ loans })
  const rules = useRulesStore()
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [phase, setPhase] = useState<'form' | 'processing' | 'success'>('form')
  // Captured before payment so the success screen still has something to show.
  const [settled, setSettled] = useState<{ amount: number; productName: string } | null>(null)

  async function pay() {
    if (!next) {
      showToast('No EMI is due right now', 'info')
      return
    }

    setPhase('processing')
    const result = await paymentService.payEmi(next.loan, next, method)

    if (!result.success || !result.transaction) {
      setPhase('form')
      showToast(result.message, 'error')
      return
    }

    applyEmiPayment(next.loan.id, next.id, result.transaction)
    setSettled({ amount: next.amount, productName: next.loan.productName })
    setPhase('success')
  }

  if (phase === 'processing') {
    return (
      <Screen title="Pay now" subtitle="Secure payment in progress.">
        <ProcessingLoader
          steps={[{ label: 'Processing payment', status: 'active' }]}
          title="Processing payment"
          subtitle="Please do not close the app."
        />
      </Screen>
    )
  }

  if (phase === 'success') {
    return (
      <Screen>
        <motion.div
          className="flex h-full flex-col items-center justify-center px-2 text-center"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          <SuccessMark className="h-28 w-28" />
          <h1 className="mt-5 text-2xl font-extrabold text-ink">Payment successful</h1>
          <p className="mt-2 text-sm text-muted">
            {settled ? formatInr(settled.amount) : ''} paid towards your {settled?.productName}. That principal
            is back on your credit limit.
          </p>
          <div className="mt-8 w-full space-y-3">
            <Button onClick={() => navigate(ROUTES.REPAYMENT_SCHEDULE)}>View schedule</Button>
            <Button variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD)}>
              Back to home
            </Button>
          </div>
        </motion.div>
      </Screen>
    )
  }

  if (!next) {
    return (
      <Screen title="Pay now" onBack={() => navigate(-1)}>
        <EmptyState
          className="mt-6"
          icon={CalendarCheck}
          title="Nothing due right now"
          description="Every instalment on your active loans is settled. We'll remind you before the next one."
          action={<Button onClick={() => navigate(ROUTES.DASHBOARD)}>Back to home</Button>}
        />
      </Screen>
    )
  }

  const product = getProduct(next.loan.productId)

  return (
    <Screen
      title="Pay now"
      subtitle="Choose how you want to pay this EMI."
      onBack={() => navigate(-1)}
      footer={<Button onClick={pay}>Pay {formatInr(next.amount)}</Button>}
    >
      <Card
        className="mt-3 text-white"
        style={{ background: productGradient(product) }}
        padding="lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-white/70">Amount due</p>
            <p className="mt-1 text-[clamp(2rem,9vw,2.5rem)] leading-none font-extrabold">
              {formatInr(next.amount)}
            </p>
          </div>
          <ProductIcon
            product={product}
            className="h-10 w-10 rounded-2xl bg-white/20"
            iconClassName="h-4 w-4"
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/12 px-3 py-2.5">
            <p className="text-[11px] text-white/70">Due date</p>
            <p className="mt-0.5 truncate text-sm font-bold">{formatDate(next.dueDate, 'medium')}</p>
          </div>
          <div className="rounded-2xl bg-white/12 px-3 py-2.5">
            <p className="text-[11px] text-white/70">Instalment</p>
            <p className="mt-0.5 truncate text-sm font-bold">
              {next.number} of {next.loan.tenure}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-white/70">{next.loan.productName}</p>
      </Card>

      <Card className="mt-3 border border-warning/25 bg-warning/10" padding="sm">
        <p className="text-xs leading-relaxed text-ink">
          <span className="font-bold">Missed payment:</span> after {rules.gracePeriodDays} days grace,
          a bounce fee of {formatInr(rules.bounceFeeFlat)} plus {rules.lateFeePercent}% late fee may
          apply. New draws pause from day {rules.blockDrawFromDpd}. Recovery contact only{' '}
          {formatContactHour(rules.agentContactFromHour)}–{formatContactHour(rules.agentContactToHour)}.
        </p>
      </Card>

      <p className="mt-5 mb-2 text-sm font-bold text-ink">Payment options</p>
      <div className="space-y-2 pb-2">
        {METHODS.map((item, index) => {
          const Icon = item.icon
          const active = method === item.id
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setMethod(item.id)}
              className={`pressable flex w-full items-center gap-3 rounded-[20px] border bg-card p-4 text-left transition-colors ${
                active ? 'border-primary shadow-[0_0_0_4px_var(--c-primary-ring)]' : 'border-transparent'
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.06 }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,var(--c-primary-soft),color-mix(in_srgb,var(--c-primary)_18%,transparent))] text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{item.label}</span>
                <span className="text-xs text-muted">{item.hint}</span>
              </span>
              <span
                className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                  active ? 'border-primary bg-primary' : 'border-line'
                }`}
              >
                {active ? <span className="m-auto mt-1 block h-1.5 w-1.5 rounded-full bg-card" /> : null}
              </span>
            </motion.button>
          )
        })}
      </div>
    </Screen>
  )
}
