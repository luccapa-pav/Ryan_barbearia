'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  Scissors, CalendarCheck, CalendarDays,
  Users, Calendar, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

const TABS = [
  { href: '/visao-geral',   label: 'Visão Geral',   icon: CalendarCheck },
  { href: '/agendamentos',  label: 'Agendamentos',  icon: CalendarDays },
  { href: '/clientes',      label: 'Clientes',      icon: Users },
  { href: '/calendario',    label: 'Calendário',    icon: Calendar },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  })

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-brand">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-semibold text-foreground text-sm leading-none">
                Ryan Barbearia
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize tabular-nums">
                {today}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-[1600px] px-4 md:px-6 py-5">

        {/* Tab navigation */}
        <nav className="mb-6 flex gap-0.5 rounded-xl bg-muted/50 p-1 overflow-x-auto scrollbar-none border border-border/40">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={cn(
                  'relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap active:scale-95',
                  active
                    ? 'bg-card text-foreground shadow-card border border-border/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-primary' : '')} />
                <span className="hidden sm:inline">{label}</span>
                {/* Mobile active dot */}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full bg-primary sm:hidden" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Page content */}
        <div className="animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  )
}
