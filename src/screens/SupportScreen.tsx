import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Ticket,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Screen } from '../components/layout/Screen'
import { HELP_TOPICS, SUPPORT_CATEGORIES, SUPPORT_EMAIL, SUPPORT_HOURS, SUPPORT_PHONE } from '../mock/data'
import supportPhoto from '../assets/photos/support.jpg'
import { supportService } from '../services/supportService'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'
import type { SupportTicket } from '../types'

const CATEGORY_OPTIONS = SUPPORT_CATEGORIES.map((item) => ({ value: item, label: item }))

export function SupportScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.profile)
  const tickets = useAppStore((state) => state.tickets)
  const addTicket = useAppStore((state) => state.addTicket)
  const showToast = useAppStore((state) => state.showToast)

  const [form, setForm] = useState({
    subject: '',
    category: '',
    message: '',
    email: profile.email,
  })
  const [sending, setSending] = useState(false)
  const [openTopic, setOpenTopic] = useState<string | null>(HELP_TOPICS[0]?.id ?? null)

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit() {
    setSending(true)
    const result = await supportService.submit(form)
    setSending(false)

    const { subject, category, message } = result.draft
    addTicket({ subject, category, message })
    setForm({ subject: '', category: '', message: '', email: profile.email })
    showToast(result.message, 'success')
  }

  return (
    <Screen
      title="Help & support"
      subtitle="We're here whenever you need us."
      onBack={() => navigate(ROUTES.DASHBOARD)}
      wide
    >
      <motion.div
        className="relative mt-3 overflow-hidden rounded-[26px]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <img src={supportPhoto} alt="" className="h-32 w-full object-cover sm:h-40" />
        <span className="photo-scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-lg font-extrabold">Talk to a real person</p>
          <p className="mt-1 text-[13px] text-white/80">{SUPPORT_HOURS}</p>
        </div>
      </motion.div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        <ContactTile
          icon={Phone}
          label="Call us"
          value={SUPPORT_PHONE}
          href={`tel:${SUPPORT_PHONE.replace(/\D/g, '')}`}
        />
        <ContactTile icon={Mail} label="Email" value={SUPPORT_EMAIL} href={`mailto:${SUPPORT_EMAIL}`} />
        <button
          type="button"
          onClick={() => navigate(ROUTES.CHAT)}
          className="pressable flex items-center gap-3 rounded-[20px] bg-primary p-4 text-left text-white shadow-[0_10px_26px_color-mix(in_srgb,var(--c-primary)_32%,transparent)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] tracking-wide text-indigo-100 uppercase">Chat</span>
            <span className="block truncate text-sm font-bold">Ask Flow now</span>
          </span>
        </button>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div>
          <h2 className="font-bold text-ink">Raise a ticket</h2>
          <Card className="mt-3 space-y-4">
            <Input
              label="Subject"
              value={form.subject}
              onChange={(event) => update('subject', event.target.value)}
              placeholder="EMI debited twice"
            />
            <Select
              label="Category"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
            />
            <Input
              label="Reply-to email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              placeholder="you@email.com"
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">How can we help?</span>
              <textarea
                value={form.message}
                onChange={(event) => update('message', event.target.value)}
                rows={4}
                placeholder="Tell us what happened, including dates and amounts."
                className="w-full resize-none rounded-2xl border border-line bg-card px-3.5 py-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus:border-primary focus:shadow-[0_0_0_4px_var(--c-primary-ring)]"
              />
            </label>
            <Button onClick={submit} loading={sending}>
              <Send className="h-4 w-4" />
              Submit ticket
            </Button>
          </Card>

          {tickets.length > 0 ? (
            <>
              <h2 className="mt-6 font-bold text-ink">Your tickets</h2>
              <div className="mt-3 space-y-2">
                {tickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6 lg:mt-0">
          <h2 className="font-bold text-ink">Common questions</h2>
          <div className="mt-3 space-y-2 pb-2">
            {HELP_TOPICS.map((topic) => {
              const open = openTopic === topic.id
              return (
                <Card key={topic.id} padding="sm">
                  <button
                    type="button"
                    onClick={() => setOpenTopic(open ? null : topic.id)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-sm font-semibold text-ink">{topic.title}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-faint transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-2.5 text-[13px] leading-6 text-muted">{topic.body}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </Screen>
  )
}

function ContactTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone
  label: string
  value: string
  href: string
}) {
  return (
    <a
      href={href}
      className="pressable flex items-center gap-3 rounded-[20px] border border-line/70 bg-card p-4 card-shadow"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,var(--c-primary-soft),color-mix(in_srgb,var(--c-primary)_18%,transparent))] text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] tracking-wide text-muted uppercase">{label}</span>
        <span className="block truncate text-sm font-bold text-ink">{value}</span>
      </span>
    </a>
  )
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  return (
    <Card className="flex items-start gap-3" padding="sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(140deg,var(--c-primary-soft),color-mix(in_srgb,var(--c-primary)_18%,transparent))] text-primary">
        <Ticket className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{ticket.subject}</p>
        <p className="text-xs text-muted">
          {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
        </p>
      </div>
      <Chip label="Open" tone="warning" />
    </Card>
  )
}
