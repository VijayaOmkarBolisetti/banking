import { ArrowDownLeft, ArrowUpRight, CreditCard, History, IndianRupee, Sparkles, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip, txnTone } from '../components/ui/Chip'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatDate, formatInr, firstName, greetingFor } from '../lib/format'
import { utilizationPercent } from '../lib/loanCalculator'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

const actions = [
  { label: 'Get money', hint: 'Withdraw', to: ROUTES.GET_MONEY, icon: IndianRupee },
  { label: 'Pay now', hint: 'Pay EMI', to: ROUTES.PAY_NOW, icon: Wallet },
  { label: 'History', hint: 'Activity', to: ROUTES.TRANSACTIONS, icon: History },
  { label: 'Credit', hint: 'Limit & usage', to: ROUTES.CREDIT_DETAILS, icon: CreditCard },
]

export function DashboardScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.profile)
  const credit = useAppStore((state) => state.credit)
  const activeLoan = useAppStore((state) => state.activeLoan)
  const transactions = useAppStore((state) => state.transactions)
  const name = firstName(profile.fullName || 'Vijay')
  const nextEmi = activeLoan?.emis.find((emi) => emi.status === 'upcoming' || emi.status === 'overdue')
  const usedPercent = utilizationPercent(credit.used, credit.limit)
  const recent = transactions.slice(0, 3)

  return (
    <div className="h-full overflow-y-auto bg-surface px-4 pt-4 pb-8 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
          <div className="min-w-0">
            <p className="text-sm text-muted">{greetingFor()}</p>
            <h1 className="truncate text-[22px] leading-7 font-extrabold text-ink lg:text-3xl">{name} 👋</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROFILE_HOME)}
            className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white uppercase lg:h-12 lg:w-12"
            aria-label="Profile"
          >
            {name.slice(0, 1)}
          </button>
        </header>

        <div className="lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-6">
          <div>
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4c6fff] to-[#1e3a8a] p-5 text-white shadow-[0_16px_40px_rgb(30_58_138_/_0.28)] lg:p-6">
              <div className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute right-10 bottom-6 h-16 w-16 rounded-full bg-cyan-300/10" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-100 uppercase">CreditFlow</p>
                  <p className="mt-3 text-xs text-indigo-100">Total credit limit</p>
                  <p className="mt-1 text-[clamp(1.5rem,7vw,2.5rem)] leading-none font-extrabold tracking-tight">
                    {formatInr(credit.limit)}
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-white/12 p-2.5">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <div className="min-w-0 rounded-2xl bg-white/10 px-3 py-2.5">
                  <p className="text-[11px] text-indigo-100">Available</p>
                  <p className="mt-0.5 truncate text-base font-bold sm:text-lg">{formatInr(credit.available)}</p>
                </div>
                <div className="min-w-0 rounded-2xl bg-white/10 px-3 py-2.5">
                  <p className="text-[11px] text-indigo-100">Used</p>
                  <p className="mt-0.5 truncate text-base font-bold sm:text-lg">{formatInr(credit.used)}</p>
                </div>
              </div>
              <div className="relative mt-4">
                <ProgressBar value={usedPercent} track="light" />
                <p className="mt-2 text-[11px] text-indigo-100">{usedPercent}% utilized</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mt-5 lg:grid-cols-4 lg:gap-3">
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="pressable flex min-h-[98px] flex-col items-center justify-center gap-1.5 rounded-[20px] bg-white px-1.5 py-3 text-center shadow-[0_8px_24px_rgb(15_23_42_/_0.05)] sm:min-h-[104px] sm:gap-2 sm:rounded-[22px] sm:px-2 sm:py-3.5 lg:min-h-[112px]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary sm:h-10 sm:w-10">
                      <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                    </span>
                    <span className="w-full min-w-0 overflow-hidden px-0.5">
                      <span className="block truncate text-[11px] font-bold leading-tight text-ink sm:text-sm">
                        {action.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted">{action.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 lg:mt-0">
            <Card padding="lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Next payment</p>
                  <p className="mt-1 text-[clamp(1.35rem,6vw,1.75rem)] leading-8 font-extrabold">
                    {nextEmi ? formatInr(nextEmi.amount) : '₹0'}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {nextEmi ? `Due on ${formatDate(nextEmi.dueDate)}` : 'No EMI scheduled yet'}
                  </p>
                </div>
                {nextEmi ? (
                  <Chip
                    label={nextEmi.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                    tone={nextEmi.status === 'overdue' ? 'danger' : 'warning'}
                  />
                ) : null}
              </div>
              <div className="mt-4">
                {nextEmi ? (
                  <Button size="md" onClick={() => navigate(ROUTES.PAY_NOW)}>
                    Pay now
                  </Button>
                ) : (
                  <Button size="md" onClick={() => navigate(ROUTES.GET_MONEY)}>
                    Get money
                  </Button>
                )}
              </div>
            </Card>

            <div className="mt-6 flex items-center justify-between gap-2">
              <h2 className="font-bold text-ink">Recent activity</h2>
              <button
                type="button"
                onClick={() => navigate(ROUTES.TRANSACTIONS)}
                className="shrink-0 text-sm font-semibold text-primary"
              >
                See all
              </button>
            </div>
            <div className="mt-3 space-y-2 pb-2">
              {recent.map((txn) => (
                <Card key={txn.id} className="flex items-center gap-2.5 sm:gap-3" padding="sm">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                      txn.amount > 0 ? 'bg-emerald-50 text-success' : 'bg-red-50 text-danger'
                    }`}
                  >
                    {txn.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{txn.title}</p>
                    <p className="text-xs text-muted">{formatDate(txn.date, 'medium')}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold sm:text-base ${txn.amount > 0 ? 'text-success' : 'text-ink'}`}>
                      {txn.amount > 0 ? '+' : ''}
                      {formatInr(txn.amount)}
                    </p>
                    <Chip
                      label={txn.status === 'success' ? 'Success' : txn.status === 'pending' ? 'Pending' : 'Failed'}
                      tone={txnTone(txn.status)}
                    />
                  </div>
                </Card>
              ))}
              {recent.length === 0 ? (
                <Card className="py-6 text-center">
                  <p className="font-semibold text-ink">No transactions yet</p>
                  <p className="mt-1 text-sm text-muted">Get money to see your activity here.</p>
                  <div className="mx-auto mt-4 max-w-[200px]">
                    <Button size="sm" onClick={() => navigate(ROUTES.GET_MONEY)}>
                      Get money
                    </Button>
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
