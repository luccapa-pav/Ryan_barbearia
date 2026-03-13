'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Plus, Clock, CheckCircle, CalendarCheck, XCircle } from 'lucide-react'
import { AgendamentoSheet } from '@/components/agendamentos/agendamento-sheet'
import { AgendamentosTable } from '@/components/agendamentos/agendamentos-table'
import { cn } from '@/lib/utils'
import type { AgendamentoComRelacoes, Servico } from '@/lib/supabase/types'

interface StatusCounts {
  pendente: number
  confirmado: number
  concluido: number
  cancelado: number
  faltou: number
}

interface AgendamentosPageClientProps {
  agendamentos: AgendamentoComRelacoes[]
  servicos: Servico[]
  total: number
  pagina: number
  pageSize: number
  statusCounts: StatusCounts
}

const STAT_CARDS = [
  {
    key: 'pendente',
    label: 'Pendentes',
    icon: Clock,
    iconBg: 'bg-amber-100 dark:bg-amber-950/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'hover:border-amber-400',
  },
  {
    key: 'confirmado',
    label: 'Confirmados',
    icon: CalendarCheck,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accent: 'hover:border-emerald-400',
  },
  {
    key: 'concluido',
    label: 'Concluídos',
    icon: CheckCircle,
    iconBg: 'bg-blue-100 dark:bg-blue-950/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accent: 'hover:border-blue-400',
  },
  {
    key: 'cancelado',
    label: 'Cancelados',
    icon: XCircle,
    iconBg: 'bg-red-100 dark:bg-red-950/40 group-hover:bg-red-200 dark:group-hover:bg-red-900/60',
    iconColor: 'text-red-500 dark:text-red-400',
    accent: 'hover:border-red-400',
  },
] as const

export function AgendamentosPageClient({
  agendamentos,
  servicos,
  total,
  pagina,
  pageSize,
  statusCounts,
}: AgendamentosPageClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState<AgendamentoComRelacoes | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeStatus = searchParams.get('status') ?? ''

  function filterByStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status) params.set('status', status); else params.delete('status')
    params.delete('pagina')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function handleEdit(agendamento: AgendamentoComRelacoes) {
    setEditingAgendamento(agendamento)
    setSheetOpen(true)
  }

  function handleNew() {
    setEditingAgendamento(null)
    setSheetOpen(true)
  }

  function handleClose() {
    setSheetOpen(false)
    setEditingAgendamento(null)
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header — título centralizado, botão à direita */}
      <div className="relative flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-5xl font-gotham font-black text-foreground tracking-tight">Agendamentos</h2>
          <p className="text-base font-semibold text-muted-foreground tracking-wide mt-1">
            {total} agendamento{total !== 1 ? 's' : ''} no total
          </p>
        </div>
        <button
          onClick={handleNew}
          className="absolute right-0 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-200 text-sm shadow-brand hover:scale-105 active:scale-95 font-gotham uppercase tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo</span>
        </button>
      </div>

      {/* Stat cards — preenchem o espaço e filtram por status */}
      <div className={cn(
        'grid grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity duration-200',
        isPending && 'opacity-60 pointer-events-none'
      )}>
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          const count = statusCounts[card.key]
          const isActive = activeStatus === card.key
          return (
            <button
              key={card.key}
              onClick={() => filterByStatus(isActive ? '' : card.key)}
              className={cn(
                'group relative bg-card rounded-xl border shadow-card hover:shadow-elevated transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-3 overflow-hidden cursor-pointer',
                isActive
                  ? 'border-primary shadow-brand scale-[1.02]'
                  : cn('border-zinc-300 dark:border-zinc-600', card.accent)
              )}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200', card.iconBg)}>
                <Icon className={cn('w-4 h-4', card.iconColor)} />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest font-gotham">
                  {card.label}
                </p>
                <p className="text-2xl font-gotham font-black text-foreground tabular-nums leading-tight mt-1">
                  {count}
                </p>
              </div>
              {isActive && (
                <span className="text-[10px] text-primary font-semibold">Filtrado ✓</span>
              )}
            </button>
          )
        })}
      </div>

      <AgendamentosTable
        agendamentos={agendamentos}
        total={total}
        pagina={pagina}
        pageSize={pageSize}
        onEdit={handleEdit}
      />

      <AgendamentoSheet
        open={sheetOpen}
        onClose={handleClose}
        agendamento={editingAgendamento}
        servicos={servicos}
      />
    </div>
  )
}
