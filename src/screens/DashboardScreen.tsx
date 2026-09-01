import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  History,
  LifeBuoy,
  Layers,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip, txnTone } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { ProductIcon } from '../components/loans/ProductIcon'
import { ThemeToggleButton } from '../components/theme/ThemeControls'
import { CoinBalance } from '../components/rewards/CoinBalance'
import { formatDate, formatInr, formatInrShort, firstName, greetingFor } from '../lib/format'
import { utilizationPercent } from '../lib/loanCalculator'
import { FEATURED_PRODUCT, LOAN_PRODUCTS, getProduct, productGradient } from '../lib/loanProducts'
import { applyRoute, ROUTES } from '../navigation/routes'
import { useConfigStore } from '../store/useConfigStore'
import {
  selectMonthlyOutflow,
  selectNextEmi,
  selectOpenLoans,
  useAppStore,
} from '../store/useAppStore'

const actions = [
  { label: 'Apply', hint: 'New loan', to: ROUTES.LOAN_PRODUCTS, icon: Layers },
  { label: 'Pay now', hint: 'Clear EMI', to: ROUTES.PAY_NOW, icon: Wallet },
  { label: 'History', hint: 'Activity', to: ROUTES.TRANSACTIONS, icon: History },
  { label: 'Support', hint: 'Get help', to: ROUTES.SUPPORT, icon: LifeBuoy },
]

export function DashboardScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.profile)
  const credit = useAppStore((state) => state.credit)
  const loans = useAppStore((state) => state.loans)
  const transactions = useAppStore((state) => state.transactions)
  const productRates = useConfigStore((state) => state.productRates)

  const name = firstName(profile.fullName || 'Vijay')
  const openLoans = selectOpenLoans({ loans })
  const nextEmi = selectNextEmi({ loans })
  const monthly = selectMonthlyOutflow({ loans })
  const usedPercent = utilizationPercent(credit.used, credit.limit)
  const recent = transactions.slice(0, 4)

  return (
    <div className="thin-scroll h-full overflow-y-auto bg-surface px-4 pt-4 pb-24 sm:px-5 lg:px-8 lg:pt-6 lg:pb-10">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <header className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
          <div className="min-w-0">
            <p className="text-sm text-muted">{greetingFor()}</p>
            <h1 className="truncate text-[22px] leading-7 font-extrabold text-ink lg:text-3xl lg:leading-tight">{name} 👋</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CoinBalance className="hidden xs:flex sm:flex" />
            <ThemeToggleButton />
            <button
              type="button"
              onClick={() => navigate(ROUTES.PROFILE_HOME)}
              className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white uppercase lg:h-12 lg:w-12"
              aria-label="Profile"
            >
              {name.slice(0, 1)}
            </button>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-6">
          <div>
            {/* Credit line */}
            <motion.div
              className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4c6fff] to-[#1e3a8a] p-5 text-white shadow-[0_16px_40px_color-mix(in_srgb,var(--c-primary)_34%,transparent)] lg:p-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute right-10 bottom-6 h-16 w-16 rounded-full bg-cyan-300/10" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-100 uppercase">
                    Pre-approved limit
                  </p>
                  <AnimatedNumber
                    value={credit.limit}
                    className="mt-2 block text-[clamp(1.5rem,7vw,2.5rem)] leading-none font-extrabold tracking-tight"
                  />
                </div>
                <div className="shrink-0 rounded-2xl bg-white/12 p-2.5">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="relative mt-6 grid grid-cols-2 gap-3">
                <div className="min-w-0 rounded-2xl bg-white/10 px-3 py-2.5">
                  <p className="text-[11px] text-indigo-100">Available</p>
                  <AnimatedNumber
                    value={credit.available}
                    className="mt-0.5 block truncate text-base font-bold sm:text-lg"
                  />
                </div>
                <div className="min-w-0 rounded-2xl bg-white/10 px-3 py-2.5">
                  <p className="text-[11px] text-indigo-100">Used</p>
                  <AnimatedNumber
                    value={credit.used}
                    className="mt-0.5 block truncate text-base font-bold sm:text-lg"
                  />
                </div>
              </div>
              <div className="relative mt-4">
                <ProgressBar value={usedPercent} tone="onColor" track="light" />
                <p className="mt-2 text-[11px] text-indigo-100">{usedPercent}% utilised</p>
              </div>
            </motion.div>

            {/* One-tap instant loan — the fastest path to money in the app */}
            <motion.button
              type="button"
              onClick={() => navigate(applyRoute(FEATURED_PRODUCT.id))}
              className="lift mt-3 flex w-full items-center gap-3 overflow-hidden rounded-[22px] p-4 text-left text-white"
              style={{ background: productGradient(FEATURED_PRODUCT, '110deg') }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <motion.span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap className="h-5 w-5" />
              </motion.span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">Need money right now?</span>
                <span className="mt-0.5 block text-xs text-white/80">
                  Up to {formatInrShort(FEATURED_PRODUCT.maxAmount)} in {FEATURED_PRODUCT.disbursalSla} · no documents
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </motion.button>

            {/* Quick actions */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mt-5 lg:grid-cols-4">
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="pressable flex min-h-[98px] flex-col items-center justify-center gap-1.5 rounded-[20px] border border-line/70 bg-card px-1.5 py-3 text-center card-shadow sm:min-h-[104px] sm:gap-2 sm:rounded-[22px]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.1 + index * 0.05 }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,var(--c-primary-soft),color-mix(in_srgb,var(--c-primary)_18%,transparent))] text-primary sm:h-10 sm:w-10">
                      <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                    </span>
                    <span className="w-full min-w-0 overflow-hidden px-0.5">
                      <span className="block truncate text-[11px] leading-tight font-bold text-ink sm:text-sm">
                        {action.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted">
                        {action.hint}
                      </span>
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Product rail */}
            <div className="mt-6 flex items-center justify-between gap-2">
              <h2 className="font-bold text-ink">Borrow for anything</h2>
              <button
                type="button"
                onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}
                className="shrink-0 text-sm font-semibold text-primary"
              >
                See all
              </button>
            </div>
            {/* Five products: a scrolling rail below xl, then a 5-up grid so
                the last card never orphans onto its own row. */}
            <div className="no-scrollbar mt-3 -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 xl:grid xl:grid-cols-5">
              {LOAN_PRODUCTS.map((product, index) => (
                <motion.button
                  key={product.id}
                  type="button"
                  onClick={() => navigate(applyRoute(product.id))}
                  className="lift relative w-[150px] shrink-0 overflow-hidden rounded-[18px] text-left card-shadow xl:w-auto"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + index * 0.06 }}
                >
                  <img src={product.photo} alt="" loading="lazy" className="h-28 w-full object-cover" />
                  <span className="photo-scrim absolute inset-0" />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <span className="block text-[13px] font-extrabold">{product.shortName}</span>
                    <span className="mt-0.5 block text-[10px] text-white/75">
                      from {productRates[product.id] ?? product.interestRate}% p.a.
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="mt-6 lg:mt-0">
            <Card padding="lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                    Next payment
                  </p>
                  <p className="mt-1 text-[clamp(1.35rem,6vw,1.75rem)] leading-8 font-extrabold">
                    {nextEmi ? formatInr(nextEmi.amount) : '₹0'}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {nextEmi
                      ? `${nextEmi.loan.productName} · due ${formatDate(nextEmi.dueDate)}`
                      : 'No EMI scheduled'}
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
                  <Button size="md" onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>
                    Apply for a loan
                  </Button>
                )}
              </div>
              {monthly > 0 ? (
                <p className="mt-3 text-xs text-muted">
                  Total monthly outflow across {openLoans.length}{' '}
                  {openLoans.length === 1 ? 'loan' : 'loans'}: {formatInr(monthly)}
                </p>
              ) : null}
            </Card>

            {openLoans.length > 0 ? (
              <>
                <div className="mt-6 flex items-center justify-between gap-2">
                  <h2 className="font-bold text-ink">Active loans</h2>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.MY_LOANS)}
                    className="shrink-0 text-sm font-semibold text-primary"
                  >
                    Manage
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {openLoans.slice(0, 3).map((loan) => {
                    const product = getProduct(loan.productId)
                    const paid = loan.emis.filter((emi) => emi.status === 'paid').length
                    return (
                      <Card key={loan.id} className="flex items-center gap-3" padding="sm">
                        <ProductIcon product={product} className="h-10 w-10 rounded-2xl" iconClassName="h-4 w-4" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
                          <p className="text-xs text-muted">
                            {paid}/{loan.tenure} paid · {formatInr(loan.monthlyEmi)}/mo
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-faint" />
                      </Card>
                    )
                  })}
                </div>
              </>
            ) : null}

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
                      txn.amount > 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                    }`}
                  >
                    {txn.amount > 0 ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{txn.title}</p>
                    <p className="text-xs text-muted">{formatDate(txn.date, 'medium')}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold sm:text-base ${
                        txn.amount > 0 ? 'text-success' : 'text-ink'
                      }`}
                    >
                      {txn.amount > 0 ? '+' : ''}
                      {formatInr(txn.amount)}
                    </p>
                    <Chip
                      label={
                        txn.status === 'success'
                          ? 'Success'
                          : txn.status === 'pending'
                            ? 'Pending'
                            : 'Failed'
                      }
                      tone={txnTone(txn.status)}
                    />
                  </div>
                </Card>
              ))}
              {recent.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No transactions yet"
                  description="Apply for a loan and your disbursals and repayments will appear here."
                  action={
                    <Button size="sm" onClick={() => navigate(ROUTES.LOAN_PRODUCTS)}>
                      Get started
                    </Button>
                  }
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
