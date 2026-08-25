import { Outlet } from 'react-router-dom'
import { BottomNav, SideNav } from './BottomNav'

/**
 * `min-w-0` matters on both levels: without it these flex/grid children take
 * their automatic minimum size, and any horizontally-scrolling row inside a
 * screen (the product rail, filter chips) stretches the whole shell wider
 * than the viewport instead of scrolling within it.
 */
export function AppShell() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 bg-surface lg:flex-row">
      <SideNav />
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
