import { Chip, emiTone, txnTone } from '../../components/ui/Chip'
import { formatDate, formatInr } from '../../lib/format'
import { useAppStore } from '../../store/useAppStore'

export function AdminLoansScreen() {
  const loan = useAppStore((state) => state.activeLoan)
  const transactions = useAppStore((state) => state.transactions)

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Loans & EMIs</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">Active credit, repayment schedule and ledger.</p>
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">Active loan</h2>
          {loan ? (
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Loan ID" value={loan.id} />
              <Row label="Amount" value={formatInr(loan.amount)} />
              <Row label="Net disbursed" value={formatInr(loan.netAmount)} />
              <Row label="Tenure" value={`${loan.tenure} months`} />
              <Row label="EMI" value={formatInr(loan.monthlyEmi)} />
              <Row label="Rate" value={`${loan.interestRate}% p.a.`} />
              <Row label="First due" value={formatDate(loan.firstDueDate)} />
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted">No active loan.</p>
          )}
          {loan ? (
            <div className="mt-5 space-y-2">
              {loan.emis.map((emi) => (
                <div key={emi.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
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
          ) : null}
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">Transactions</h2>
          <div className="mt-4 space-y-2">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold">{txn.title}</p>
                  <p className="text-xs text-muted">{formatDate(txn.date, 'medium')}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${txn.amount > 0 ? 'text-success' : 'text-ink'}`}>{formatInr(txn.amount)}</p>
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