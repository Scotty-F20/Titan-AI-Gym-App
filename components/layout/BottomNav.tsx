'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Zap, Dumbbell, Bot, BarChart3 } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/',           label: 'Home',     icon: Home },
  { href: '/workout',    label: 'Generate', icon: Zap },
  { href: '/live',       label: 'Live',     icon: Dumbbell },
  { href: '/coach',      label: 'Coach',    icon: Bot },
  { href: '/program',    label: 'Program',  icon: BarChart3 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-titan-border safe-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 transition-all duration-200 touch-target
                ${active
                  ? 'text-titan-accent'
                  : 'text-titan-muted hover:text-titan-text'
                }`}
            >
              <Icon
                size={22}
                className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span className={`text-2xs font-medium tracking-wide ${active ? 'text-titan-accent' : ''}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-titan-accent rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
