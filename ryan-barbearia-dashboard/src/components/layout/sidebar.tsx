'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  CalendarCheck,
  Users,
  Settings,
  Calendar,
  Scissors,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/hoje', label: 'Hoje', icon: CalendarCheck },
  { href: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm leading-none">Ryan</p>
          <p className="text-muted-foreground text-xs mt-0.5">Barbearia</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          v1.0.0 · Ryan Barbearia
        </p>
      </div>
    </aside>
  )
}
