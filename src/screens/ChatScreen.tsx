import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ROUTES } from '../navigation/routes'
import { useAppStore } from '../store/useAppStore'

/** Full-screen assistant, for when the floating widget isn't enough room. */
export function ChatScreen() {
  const navigate = useNavigate()
  const clearChat = useAppStore((state) => state.clearChat)

  return (
    <div className="grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-surface">
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-card px-4 py-3 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(ROUTES.SUPPORT)}
          className="pressable flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 text-ink" strokeWidth={2.2} />
        </button>

        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#1e3a8a] text-white">
          <Sparkles className="h-4 w-4" />
          <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">Flow assistant</p>
          <p className="text-[11px] text-muted">Online · replies instantly</p>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="pressable rounded-xl p-2 text-faint hover:bg-subtle hover:text-ink"
          aria-label="Restart conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-col overflow-hidden">
        <ChatPanel className="h-full" showHeader={false} />
      </div>
    </div>
  )
}
