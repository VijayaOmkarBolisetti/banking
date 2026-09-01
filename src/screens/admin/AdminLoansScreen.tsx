import { useState } from 'react'
import { Chip, emiTone, txnTone } from '../../components/ui/Chip'
import { ProductIcon } from '../../components/loans/ProductIcon'
import { formatDate, formatInr } from '../../lib/format'
import { formatTenure, getProduct } from '../../lib/loanProducts'
import { useAppStore } from '../../store/useAppStore'

export function AdminLoansScreen() {
  const loans = useAppStore((state) => state.loans)
  const transactions = useAppStore((state) => state.transactions)
  const [activeId, setActiveId] = useState<string | undefined>(loans[0]?.id)

  const loan = loans.find((item) => item.id === activeId) ?? loans[0] ?? null

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Loans &amp; EMIs</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">
        Every product the customer holds, its schedule and the ledger.
      </p>

      {loans.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {loans.map((item) => {
            const product = getProduct(item.productId)
            const active = item.id === loan?.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                  active ? 'text-white' : 'bg-card text-muted'
                }`}
                style={active ? { background: product.accent } : undefined}
              >
                {product.shortName}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
          <h2 className="font-bold">Loan detail</h2>
          {loan ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <ProductIcon product={getProduct(loan.productId)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{loan.productName}</p>
                  <p className="text-xs text-muted">{loan.id}</p>
                </div>
                <Chip label={loan.closed ? 'Closed' : 'Active'} tone={loan.closed ? 'neutral' : 'success'} />
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Amount" value={formatInr(loan.amount)} />
                <Row label="Net disbursed" value={formatInr(loan.netAmount)} />
                <Row label="Tenure" value={formatTenure(loan.tenure)} />
                <Row label="EMI" value={formatInr(loan.monthlyEmi)} />
                <Row label="Rate" value={`${loan.interestRate}% p.a.`} />
                <Row label="Total interest" value={formatInr(loan.totalInterest)} />
                <Row label="First due" value={formatDate(loan.firstDueDate)} />
              </dl>

              <div className="mt-5 max-h-96 space-y-2 overflow-y-auto">
                {loan.emis.map((emi) => (
                  <div
                    key={emi.id}
                    className="flex items-center justify-between rounded-2xl bg-subtle px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-semibold">EMI {emi.number}</p>
                      <p className="text-xs text-muted">{formatDate(emi.dueDate, 'medium')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatInr(emi.amount)}</p>
                      <Chip label={emi.status} tone={emiTone(emi.status)} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">No loans yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
          <h2 className="font-bold">Transactions</h2>
          <div className="mt-4 max-h-[32rem] space-y-2 overflow-y-auto">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between rounded-2xl bg-subtle px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{txn.title}</p>
                  <p className="text-xs text-muted">{formatDate(txn.date, 'medium')}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-bold ${txn.amount > 0 ? 'text-success' : 'text-ink'}`}>
                    {formatInr(txn.amount)}
                  </p>
                  <Chip label={txn.status} tone={txnTone(txn.status)} />
                </div>
              </div>
            ))}
            {transactions.length === 0 ? <p className="text-sm text-muted">No transactions yet.</p> : null}
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
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}
