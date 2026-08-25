import { LifeBuoy, MessageCircle } from 'lucide-react'
import { Chip } from '../../components/ui/Chip'
import { useAppStore } from '../../store/useAppStore'

export function AdminSupportScreen() {
  const tickets = useAppStore((state) => state.tickets)
  const chat = useAppStore((state) => state.chat)
  const userTurns = chat.filter((message) => message.role === 'user')

  return (
    <div>
      <h1 className="hidden text-2xl font-extrabold text-ink lg:block">Support</h1>
      <p className="mt-1 hidden text-sm text-muted lg:block">
        Tickets raised by the customer and what they asked the assistant.
      </p>

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <LifeBuoy className="h-4 w-4 text-primary" />
            Tickets ({tickets.length})
          </h2>
          <div className="mt-4 space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl bg-subtle px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 text-sm font-semibold text-ink">{ticket.subject}</p>
                  <Chip label={ticket.status === 'open' ? 'Open' : 'Resolved'} tone={ticket.status === 'open' ? 'warning' : 'success'} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {ticket.category} · {new Date(ticket.createdAt).toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-[13px] leading-5 text-muted">{ticket.message}</p>
              </div>
            ))}
            {tickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No tickets raised yet.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-line/70 bg-card p-5 card-shadow sm:p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <MessageCircle className="h-4 w-4 text-primary" />
            Assistant questions ({userTurns.length})
          </h2>
          <div className="mt-4 space-y-2">
            {userTurns
              .slice()
              .reverse()
              .map((message) => (
                <div key={message.id} className="rounded-2xl bg-subtle px-4 py-2.5">
                  <p className="text-[13px] text-ink">{message.text}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {new Date(message.at).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            {userTurns.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                Nothing asked yet. Questions the customer types into the chat widget land here.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
