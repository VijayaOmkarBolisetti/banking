import { Activity, IndianRupee, Users, Wallet } from 'lucide-react'
import { formatInr } from '../../lib/format'
import { useAdminStore } from '../../store/useAdminStore'
import { useAppStore } from '../../store/useAppStore'
import { useConfigStore } from '../../store/useConfigStore'

export function AdminDashboardScreen() {
  const profile = useAppStore((state) => state.profile)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const credit = useAppStore((state) => state.credit)
  const loan = useAppStore((state) => state.activeLoan)
  const transactions = useAppStore((state) => state.transactions)
  const operations = useAdminStore((state) => state.operations)
  const config = useConfigStore()
  const paidEmis = loan?.emis.filter((emi) => emi.status === 'paid').length ?? 0

  const cards = [
    { label: 'Credit limit', value: formatInr(config.creditLimit), icon: IndianRupee },
    { label: 'EMI range', value: `${formatInr(config.minAmount)} – ${formatInr(config.maxAmount)}`, icon: Wallet },
    { label: 'Customers', value: profile.fullName || isAuthenticated ? '1' : '0', icon: Users },
    { label: 'Operations', value: String(operations.length), icon: Activity },
  ]

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Overview</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">Live product settings and customer activity.</p>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[11px] font-semibold tracking-wide text-muted uppercase sm:mt-4">{card.label}</p>
              <p className="mt-1 break-words text-lg font-extrabold text-ink sm:text-xl">{card.value}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">Current customer</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={profile.fullName || '—'} />
            <Row label="Used credit" value={formatInr(credit.used)} />
            <Row label="Available" value={formatInr(credit.available)} />
            <Row label="Active loan" value={loan ? formatInr(loan.amount) : 'None'} />
            <Row label="EMIs paid" value={loan ? `${paidEmis} / ${loan.tenure}` : '—'} />
            <Row label="Transactions" value={String(transactions.length)} />
          </dl>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-bold">Latest operations</h2>
          <div className="mt-4 space-y-3">
            {operations.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted">{item.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-slate-400 uppercase">{item.actor}</span>
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
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}