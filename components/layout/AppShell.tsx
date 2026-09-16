'use client'

import BottomNav from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
  hideNav?: boolean
}

export default function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-titan-bg flex flex-col">
      <main className={`flex-1 ${!hideNav ? 'pb-20' : ''} page-enter`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
