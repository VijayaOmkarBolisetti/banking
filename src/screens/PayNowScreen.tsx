import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, CreditCard, Smartphone } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LottiePlayer } from '../components/ui/LottiePlayer'
import { ProcessingLoader } from '../components/ui/ProcessingLoader'
import { Screen } from '../components/layout/Screen'
import { formatDate, formatInr } from '../lib/format'
import { paymentService } from '../services/paymentService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import type { PaymentMethod } from '../types'

const METHODS: { id: PaymentMethod; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'debit_card', label: 'Debit Card', hint: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'net_banking', label: 'Net Banking', hint: 'All major Indian banks', icon: Building2 },
]

export function PayNowScreen() {
  const navigate = useNavigate()
  const loan = useAppStore((state) => state.activeLoan)
  const updateLoan = useAppStore((state) => state.updateLoan)
  const addTransaction = useAppStore((state) => state.addTransaction)
  const showToast = useAppStore((state) => state.showToast)
  const next = loan?.emis.find((emi) => emi.status === 'upcoming' || emi.status === 'overdue')
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [phase, setPhase] = useState<'form' | 'processing' | 'success'>('form')

  async function pay() {
    if (!loan || !next) {
      showToast('No EMI is due right now', 'info')
      return
    }
    setPhase('processing')
    const result = await paymentService.payNextEmi(loan, method)
    if (!result.success || !result.loan) {
      setPhase('form')
      showToast(result.message, 'error')
      return
    }
    updateLoan(result.loan)
    if (result.transaction) addTransaction(result.transaction)
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
          className="flex h-full flex-col items-center justify-center text-center"
          initial={{ opacity: 0, transform: 'scale(0.96)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
        >
          <LottiePlayer name="success" loop={false} className="h-32 w-32" />
          <h1 className="mt-4 text-2xl font-extrabold">Payment Successful ✓</h1>
          <p className="mt-2 text-sm text-muted">{next ? formatInr(next.amount) : ''} has been marked as paid.</p>
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

  return (
    <Screen
      title="Pay now"
      subtitle="Choose how you want to pay this EMI."
      onBack={() => navigate(-1)}
      footer={
        <Button onClick={pay} disabled={!next}>
          Pay Now
        </Button>
      }
    >
      <Card className="mt-3 bg-primary text-white" padding="lg">
        <p className="text-sm text-indigo-100">Amount Due</p>
        <p className="mt-1 text-4xl font-extrabold">{next ? formatInr(next.amount) : '₹0'}</p>
        <p className="mt-3 text-sm text-indigo-100">Due Date</p>
        <p className="font-semibold">{next ? formatDate(next.dueDate) : 'No upcoming EMI'}</p>
      </Card>
      <p className="mt-5 mb-2 text-sm font-bold">Payment options</p>
      <div className="space-y-2">
        {METHODS.map((item) => {
          const Icon = item.icon
          const active = method === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMethod(item.id)}
              className={`pressable flex w-full items-center gap-3 rounded-[20px] border bg-white p-4 text-left ${
                active ? 'border-primary shadow-[0_0_0_4px_rgb(238_242_255)]' : 'border-transparent'
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">{item.label}</span>
                <span className="text-xs text-muted">{item.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Screen>
  )
}
