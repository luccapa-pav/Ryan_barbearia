'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarCheck, CalendarDays, Users, Calendar, Settings, LogOut, ShieldCheck, Clock } from 'lucide-react'
import { cn, formatarHora } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { KeyboardShortcuts } from './keyboard-shortcuts'
import { PageTransition } from './page-transition'
import { logout } from '@/actions/auth'

const BASE_TABS = [
  { href: '/visao-geral',   label: 'Visão Geral',   shortLabel: 'Geral',  icon: CalendarCheck },
  { href: '/calendario',    label: 'Calendário',    shortLabel: 'Cal.',   icon: Calendar },
  { href: '/agendamentos',  label: 'Agendamentos',  shortLabel: 'Ag.',    icon: CalendarDays },
  { href: '/clientes',      label: 'Clientes',      shortLabel: 'Cli.',   icon: Users },
  { href: '/configuracoes', label: 'Configurações', shortLabel: 'Config', icon: Settings },
]

interface ProximoCliente {
  data_hora: string
  clientes: { nome: string } | null
  servicos: { nome: string } | null
}

interface DashboardShellProps {
  children: React.ReactNode
  isAdmin?: boolean
  pendentesCount?: number
  proximoCliente?: ProximoCliente | null
}

export function DashboardShell({ children, isAdmin = false, pendentesCount = 0, proximoCliente = null }: DashboardShellProps) {
  const pathname = usePathname()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  })

  const TABS = isAdmin
    ? [...BASE_TABS, { href: '/admin', label: 'Admin', shortLabel: 'Admin', icon: ShieldCheck, badge: pendentesCount }]
    : BASE_TABS

  return (
    <div className="min-h-screen bg-background">
      <KeyboardShortcuts />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl shadow-sm relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
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

          {/* Próximo cliente pill */}
          {proximoCliente && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/20 text-xs">
              <Clock className="w-3 h-3 text-primary shrink-0" />
              <span className="font-bold text-primary tabular-nums">{formatarHora(proximoCliente.data_hora)}</span>
              <span className="text-foreground/70 font-medium truncate max-w-[120px]">{proximoCliente.clientes?.nome}</span>
              <span className="text-muted-foreground truncate max-w-[90px] hidden lg:inline">{proximoCliente.servicos?.nome}</span>
            </div>
          )}

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
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-muted/50 via-card/30 to-card/20 p-4 md:p-5 shadow-sm">

          {/* Tab navigation */}
          <nav className="mb-5 flex justify-center gap-0.5 rounded-xl bg-muted/60 p-1 overflow-x-auto scrollbar-none border border-border/50">
            {TABS.map(({ href, label, icon: Icon, ...rest }, i) => {
              const badge = 'badge' in rest ? (rest as { badge: number }).badge : 0
              const shortLabel = 'shortLabel' in rest ? (rest as { shortLabel: string }).shortLabel : label
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  title={`Atalho: ${i + 1}`}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 sm:px-4 text-sm font-semibold transition-all duration-150 whitespace-nowrap active:scale-95 hover:scale-105',
                    active
                      ? 'bg-card text-foreground shadow-card border border-border/80 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/70'
                  )}
                >
                  {/* Mobile: ícone + label curto em coluna */}
                  <span className="sm:hidden flex flex-col items-center gap-0.5">
                    <span className="relative">
                      <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-primary' : '')} />
                      {badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] font-bold font-gotham leading-none">{shortLabel}</span>
                  </span>
                  {/* Desktop: ícone + label completo em linha */}
                  <span className="hidden sm:relative sm:flex sm:items-center">
                    <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-primary' : '')} />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Page content — anima em cada troca de rota sem remontar */}
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  )
}
