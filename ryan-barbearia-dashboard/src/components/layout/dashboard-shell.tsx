'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarCheck, CalendarDays, Users, Calendar, Settings, LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { KeyboardShortcuts } from './keyboard-shortcuts'
import { logout } from '@/actions/auth'

const BASE_TABS = [
  { href: '/visao-geral',   label: 'Visão Geral',   icon: CalendarCheck },
  { href: '/calendario',    label: 'Calendário',    icon: Calendar },
  { href: '/agendamentos',  label: 'Agendamentos',  icon: CalendarDays },
  { href: '/clientes',      label: 'Clientes',      icon: Users },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

interface DashboardShellProps {
  children: React.ReactNode
  isAdmin?: boolean
  pendentesCount?: number
}

export function DashboardShell({ children, isAdmin = false, pendentesCount = 0 }: DashboardShellProps) {
  const pathname = usePathname()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  })

  const TABS = isAdmin
    ? [...BASE_TABS, { href: '/admin', label: 'Admin', icon: ShieldCheck, badge: pendentesCount }]
    : BASE_TABS

  return (
    <div className="min-h-screen bg-background">
      <KeyboardShortcuts />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand — avatar RG */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-brand transition-transform duration-200 hover:scale-110 active:scale-95 cursor-default select-none">
              <span className="font-gotham font-black text-white text-sm tracking-tight">RG</span>
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <p className="font-gotham font-bold text-foreground text-sm leading-none tracking-wide">
                Ryan Gomes
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize tabular-nums">
                {today}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="w-px h-4 bg-border mx-1.5" />
            <form action={logout}>
              <button
                type="submit"
                title="Sair da conta"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 active:scale-95 hover:scale-105"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-[1600px] px-4 md:px-6 py-5">
        <div className="rounded-2xl border border-primary/20 bg-card/30 p-4 md:p-5 shadow-sm">

          {/* Tab navigation */}
          <nav className="mb-5 flex justify-center gap-0.5 rounded-xl bg-muted/60 p-1 overflow-x-auto scrollbar-none border border-border/50">
            {TABS.map(({ href, label, icon: Icon, ...rest }, i) => {
              const badge = 'badge' in rest ? (rest as { badge: number }).badge : 0
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  title={`Atalho: ${i + 1}`}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 whitespace-nowrap active:scale-95 hover:scale-105',
                    active
                      ? 'bg-card text-foreground shadow-card border border-border/80 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/70'
                  )}
                >
                  <span className="relative">
                    <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-primary' : '')} />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full bg-primary sm:hidden" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Page content */}
          <div key={pathname} className="animate-fade-up">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
