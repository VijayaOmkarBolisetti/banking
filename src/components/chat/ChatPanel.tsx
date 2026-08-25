import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, SendHorizontal, Sparkles } from 'lucide-react'
import { useChat } from './useChat'
import type { ChatMessage } from '../../types'

interface ChatPanelProps {
  /** Rounded corners are supplied by the host (sheet, page or docked panel). */
  className?: string
  showReset?: boolean
  /** The full-screen route renders its own header, so it opts out of this one. */
  showHeader?: boolean
}

export function ChatPanel({ className = '', showReset = true, showHeader = true }: ChatPanelProps) {
  const { messages, typing, send, handleQuickReply, reset } = useChat()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typing])

  function submit(event: FormEvent) {
    event.preventDefault()
    send(draft)
    setDraft('')
  }

  const last = messages[messages.length - 1]
  const quickReplies = !typing && last?.role === 'bot' ? (last.quickReplies ?? []) : []

  return (
    <div className={`flex min-h-0 flex-col bg-surface ${className}`}>
      {showHeader ? (
        <header className="flex shrink-0 items-center gap-3 border-b border-line bg-card px-4 py-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#1e3a8a] text-white">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">Flow assistant</p>
            <p className="text-[11px] text-muted">{typing ? 'Typing…' : 'Online · replies instantly'}</p>
          </div>
          {showReset ? (
            <button
              type="button"
              onClick={reset}
              className="pressable rounded-xl p-2 text-faint hover:bg-subtle hover:text-ink"
              aria-label="Restart conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : null}
        </header>
      ) : null}

      <div ref={scrollRef} className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}

        <AnimatePresence>
          {typing ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-line/70 bg-card px-4 py-3 card-shadow"
            >
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-faint"
                  style={{ animationDelay: `${dot * 0.15}s` }}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {quickReplies.length > 0 ? (
        <div className="no-scrollbar shrink-0 overflow-x-auto px-4 pb-2">
          <div className="flex gap-2">
            {quickReplies.map((reply) => (
              <motion.button
                key={reply.label}
                type="button"
                onClick={() => handleQuickReply(reply)}
                className="pressable shrink-0 rounded-full border border-primary/25 bg-card px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-primary"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {reply.label}
              </motion.button>
            ))}
          </div>
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className="screen-footer flex shrink-0 items-center gap-2 border-t border-line bg-card px-4 pt-3"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about EMIs, rates, products…"
          aria-label="Message"
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_4px_var(--c-primary-ring)]"
        />
        <button
          type="submit"
          disabled={!draft.trim() || typing}
          className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:bg-line"
          aria-label="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  const isBot = message.role === 'bot'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <p
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 whitespace-pre-line ${
          isBot
            ? 'rounded-bl-md border border-line/70 bg-card text-ink card-shadow'
            : 'rounded-br-md bg-primary text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--c-primary)_32%,transparent)]'
        }`}
      >
        {message.text}
      </p>
    </motion.div>
  )
}
