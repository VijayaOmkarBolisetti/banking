import { Activity, IndianRupee, LifeBuoy, Users, Wallet } from 'lucide-react'
import { formatInr } from '../../lib/format'
import { getProduct } from '../../lib/loanProducts'
import { useAdminStore } from '../../store/useAdminStore'
import {
  selectMonthlyOutflow,
  selectOpenLoans,
  selectTotalOutstanding,
  useAppStore,
} from '../../store/useAppStore'
import { useConfigStore } from '../../store/useConfigStore'

export function AdminDashboardScreen() {
  const profile = useAppStore((state) => state.profile)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const credit = useAppStore((state) => state.credit)
  const loans = useAppStore((state) => state.loans)
  const transactions = useAppStore((state) => state.transactions)
  const tickets = useAppStore((state) => state.tickets)
  const operations = useAdminStore((state) => state.operations)
  const creditLimit = useConfigStore((state) => state.creditLimit)

  const openLoans = selectOpenLoans({ loans })
  const outstanding = selectTotalOutstanding({ loans })
  const monthly = selectMonthlyOutflow({ loans })
  const customers = profile.fullName || isAuthenticated ? 1 : 0

  const cards = [
    { label: 'Credit limit', value: formatInr(creditLimit), icon: IndianRupee },
    { label: 'Outstanding', value: formatInr(outstanding), icon: Wallet },
    { label: 'Customers', value: String(customers), icon: Users },
    { label: 'Open tickets', value: String(tickets.length), icon: LifeBuoy },
  ]

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Overview</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">Live product settings and customer activity.</p>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-3xl border border-line/70 bg-card p-4 card-shadow sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,var(--c-primary-soft),color-mix(in_srgb,var(--c-primary)_18%,transparent))] text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[11px] font-semibold tracking-wide text-muted uppercase sm:mt-4">
                {card.label}
              </p>
              <p className="mt-1 text-lg font-extrabold break-words text-ink sm:text-xl">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow">
          <h2 className="font-bold">Current customer</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={profile.fullName || '—'} />
            <Row label="Used credit" value={formatInr(credit.used)} />
            <Row label="Available" value={formatInr(credit.available)} />
            <Row label="Active loans" value={String(openLoans.length)} />
            <Row label="Monthly EMIs" value={formatInr(monthly)} />
            <Row label="Transactions" value={String(transactions.length)} />
          </dl>

          {openLoans.length > 0 ? (
            <div className="mt-4 space-y-2 border-t border-line pt-4">
              {openLoans.map((loan) => {
                const product = getProduct(loan.productId)
                const paid = loan.emis.filter((emi) => emi.status === 'paid').length
                return (
                  <div key={loan.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: product.accent }}
                      />
                      <span className="truncate">{product.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {paid}/{loan.tenure} · {formatInr(loan.monthlyEmi)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow">
          <h2 className="flex items-center gap-2 font-bold">
            <Activity className="h-4 w-4 text-primary" />
            Latest operations
          </h2>
          <div className="mt-4 space-y-3">
            {operations.slice(0, 7).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.title}</p>
                  <p className="text-xs text-muted">{item.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-faint uppercase">
                  {item.actor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
