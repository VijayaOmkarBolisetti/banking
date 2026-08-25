import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ToastViewport } from '../ui/ToastViewport'
import { DemoMenu } from '../demo/DemoMenu'
import { ChatWidget } from '../chat/ChatWidget'

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const location = useLocation()
  const isApp = location.pathname.startsWith('/app')
  // The assistant lives inside the app, but not on top of itself.
  const showChat = isApp && location.pathname !== '/app/chat'

  return (
    <div className={`app-stage ${isApp ? 'is-app' : 'is-auth'}`}>
      <div className="app-shell">
        <div className="app-main relative min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
      {showChat ? <ChatWidget /> : null}
      <DemoMenu />
      <ToastViewport />
    </div>
  )
}
