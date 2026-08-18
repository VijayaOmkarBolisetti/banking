import { formatInr } from '../../lib/format'
import { useAdminStore } from '../../store/useAdminStore'

export function AdminOperationsScreen() {
  const operations = useAdminStore((state) => state.operations)

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Operations</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">Every customer and admin action in this demo environment.</p>
      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="hidden gap-3 border-b border-slate-100 px-5 py-3 text-[11px] font-bold tracking-wide text-muted uppercase md:grid md:grid-cols-[140px_90px_1fr_120px]">
          <span>Time</span>
          <span>Actor</span>
          <span>Event</span>
          <span className="text-right">Amount</span>
        </div>
        {operations.map((item) => (
          <div
            key={item.id}
            className="border-b border-slate-50 px-4 py-4 text-sm last:border-0 md:grid md:grid-cols-[140px_90px_1fr_120px] md:items-start md:gap-3 md:px-5 md:py-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2 md:mb-0 md:block">
              <span className="text-xs text-muted">{new Date(item.at).toLocaleString('en-IN')}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase md:hidden">
                {item.actor}
              </span>
            </div>
            <span className="hidden text-xs font-semibold capitalize md:block">{item.actor}</span>
            <div className="min-w-0">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">{item.detail}</p>
            </div>
            <span className="mt-2 block font-semibold md:mt-0 md:text-right">
              {item.amount != null ? formatInr(item.amount) : '—'}
            </span>
          </div>
        ))}
        {operations.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No operations yet.</p>
        ) : null}
      </div>
    </div>
  )
}
