import { Outlet } from 'react-router-dom'
import { BottomNav, SideNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex h-full min-h-0 bg-surface lg:flex-row">
      <SideNav />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
