import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, BadgePercent } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Chip, txnTone } from '../components/ui/Chip'
import { Screen } from '../components/layout/Screen'
import { formatDate, formatInr } from '../lib/format'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import type { TransactionType } from '../types'

const FILTERS: { id: 'all' | TransactionType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'credit', label: 'Credits' },
  { id: 'payment', label: 'Payments' },
  { id: 'charge', label: 'Charges' },
]

export function TransactionsScreen() {
  const navigate = useNavigate()
  const transactions = useAppStore((state) => state.transactions)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const items = useMemo(
    () => (filter === 'all' ? transactions : transactions.filter((item) => item.type === filter)),
    [filter, transactions],
  )

  return (
    <Screen title="Transactions" subtitle="Credits, charges and repayments." onBack={() => navigate(ROUTES.DASHBOARD)}>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`pressable rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap ${
              filter === item.id ? 'bg-primary text-white' : 'bg-white text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-2 space-y-2">
        {items.map((txn) => (
          <Card key={txn.id} className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                txn.type === 'credit'
                  ? 'bg-emerald-50 text-success'
                  : txn.type === 'charge'
                    ? 'bg-amber-50 text-warning'
                    : 'bg-red-50 text-danger'
              }`}
            >
              {txn.type === 'credit' ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : txn.type === 'charge' ? (
                <BadgePercent className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{txn.title}</p>
              <p className="text-xs text-muted">{formatDate(txn.date, 'medium')}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${txn.amount > 0 ? 'text-success' : 'text-ink'}`}>
                {txn.amount > 0 ? '+' : ''}
                {formatInr(txn.amount)}
              </p>
              <Chip label={txn.status === 'success' ? 'Success' : txn.status === 'pending' ? 'Pending' : 'Failed'} tone={txnTone(txn.status)} />
            </div>
          </Card>
        ))}
        {items.length === 0 ? <p className="py-10 text-center text-sm text-muted">No transactions in this filter.</p> : null}
      </div>
    </Screen>
  )
}
