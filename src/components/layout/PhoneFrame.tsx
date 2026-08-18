import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ToastViewport } from '../ui/ToastViewport'

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const location = useLocation()
  const isApp = location.pathname.startsWith('/app')
  const now = new Date()
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div className={`app-stage ${isApp ? 'is-app' : 'is-auth'}`}>
      <div className="app-shell">
        <div className="app-status hidden items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-slate-500">
          <span>{time}</span>
          <span className="h-4 w-24 rounded-full bg-ink/90" />
          <span>5G · 88%</span>
        </div>
        <div className="app-main relative min-h-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>
      <ToastViewport />
    </div>
  )
}
