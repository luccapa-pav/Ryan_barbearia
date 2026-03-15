'use client'

import { useState, useMemo, useTransition, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Plus, SlidersHorizontal, X, ChevronDown, AlignJustify, List } from 'lucide-react'
import { AgendamentoSheet } from '@/components/agendamentos/agendamento-sheet'
import { AgendamentosTable } from '@/components/agendamentos/agendamentos-table'
import { DatePickerFilter } from '@/components/agendamentos/date-picker-filter'
import { cn } from '@/lib/utils'
import type { AgendamentoComRelacoes, Servico } from '@/lib/supabase/types'
import { Clock, CheckCircle, CalendarCheck, XCircle, UserX } from 'lucide-react'

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: 'pendente',   label: 'Pendente'   },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado',  label: 'Cancelado'  },
  { value: 'concluido',  label: 'Concluído'  },
  { value: 'faltou',     label: 'Faltou'     },
]

// Pendentes e Confirmados: cinza. Cancelados e Concluídos: cor suave no light, forte no dark.
const STAT_CARDS = [
  {
    key: 'pendente',
    label: 'Pendentes',
    icon: Clock,
    iconBg: 'bg-zinc-100 dark:bg-zinc-800/60',
    iconColor: 'text-zinc-400 dark:text-zinc-400',
    activeBorder: 'border-zinc-400 shadow-[0_0_0_1px_theme(colors.zinc.400)]',
    hoverBorder: 'hover:border-zinc-300',
  },
  {
    key: 'confirmado',
    label: 'Confirmados',
    icon: CalendarCheck,
    iconBg: 'bg-zinc-100 dark:bg-zinc-800/60',
    iconColor: 'text-zinc-400 dark:text-zinc-400',
    activeBorder: 'border-zinc-400 shadow-[0_0_0_1px_theme(colors.zinc.400)]',
    hoverBorder: 'hover:border-zinc-300',
  },
  {
    key: 'cancelado',
    label: 'Cancelados',
    icon: XCircle,
    iconBg: 'bg-red-50 dark:bg-red-500/20',
    iconColor: 'text-red-300 dark:text-red-400',
    activeBorder: 'border-red-400 shadow-[0_0_0_1px_theme(colors.red.400)]',
    hoverBorder: 'hover:border-red-200 dark:hover:border-red-500',
  },
  {
    key: 'concluido',
    label: 'Concluídos',
    icon: CheckCircle,
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-300 dark:text-emerald-400',
    activeBorder: 'border-emerald-400 shadow-[0_0_0_1px_theme(colors.emerald.400)]',
    hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-500',
  },
  {
    key: 'faltou',
    label: 'Faltaram',
    icon: UserX,
    iconBg: 'bg-violet-50 dark:bg-violet-500/20',
    iconColor: 'text-violet-300 dark:text-violet-400',
    activeBorder: 'border-violet-400 shadow-[0_0_0_1px_theme(colors.violet.400)]',
    hoverBorder: 'hover:border-violet-200 dark:hover:border-violet-500',
  },
] as const

interface AgendamentosPageClientProps {
  agendamentos: AgendamentoComRelacoes[]
  servicos: Servico[]
  autoOpenSheet?: boolean
}

export function AgendamentosPageClient({ agendamentos, servicos, autoOpenSheet = false }: AgendamentosPageClientProps) {
  // Múltiplos status selecionáveis
  const [filterStatuses, setFilterStatuses] = useState<string[]>([])
  // Feature 4: filtro "Hoje" ativo por padrão
  const [filterData, setFilterData] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(autoOpenSheet)
  const [editingAgendamento, setEditingAgendamento] = useState<AgendamentoComRelacoes | null>(null)
  const [compact, setCompact] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // Lê preferência de densidade do localStorage após hydration
  useEffect(() => {
    const saved = localStorage.getItem('ryan-table-density')
    if (saved === 'compact') setCompact(true)
  }, [])

  const statusCounts = useMemo(() => ({
    pendente:   agendamentos.filter(a => a.status === 'pendente').length,
    confirmado: agendamentos.filter(a => a.status === 'confirmado').length,
    cancelado:  agendamentos.filter(a => a.status === 'cancelado').length,
    concluido:  agendamentos.filter(a => a.status === 'concluido').length,
    faltou:     agendamentos.filter(a => a.status === 'faltou').length,
  }), [agendamentos])

  // Feature 1: card com maior contagem recebe destaque visual
  const maxStatusKey = useMemo(() => {
    const entries = Object.entries(statusCounts) as [keyof typeof statusCounts, number][]
    return entries.reduce((a, b) => b[1] > a[1] ? b : a)[0]
  }, [statusCounts])

  // Filtro client-side INSTANTÂNEO — suporta múltiplos status
  const filtered = useMemo(() => {
    return agendamentos.filter(a => {
      if (filterStatuses.length > 0 && !filterStatuses.includes(a.status)) return false
      if (filterData && a.data_hora.slice(0, 10) !== filterData) return false
      return true
    })
  }, [agendamentos, filterStatuses, filterData])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeFiltersCount = filterStatuses.length + (filterData ? 1 : 0)

  function toggleStatus(status: string) {
    startTransition(() => {
      setFilterStatuses(prev =>
        prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
      )
      setPage(1)
    })
  }

  function setDate(v: string) {
    startTransition(() => { setFilterData(v); setPage(1) })
  }

  function clearAll() {
    startTransition(() => {
      setFilterStatuses([])
      setFilterData('')
      setFiltersOpen(false)
      setPage(1)
    })
  }

  function handleClose() {
    setSheetOpen(false)
    setEditingAgendamento(null)
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="relative flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-5xl font-gotham font-black text-foreground tracking-tight">Agendamentos</h2>
          <p className="text-base font-semibold text-muted-foreground tracking-wide mt-1">
            {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <div className="absolute right-0 flex items-center gap-2">
          {/* Toggle de densidade */}
          <button
            onClick={() => {
              const next = !compact
              setCompact(next)
              localStorage.setItem('ryan-table-density', next ? 'compact' : 'normal')
            }}
            title={compact ? 'Visualização normal' : 'Visualização compacta'}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all hover:scale-105 active:scale-95"
          >
            {compact ? <AlignJustify className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setEditingAgendamento(null); setSheetOpen(true) }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-200 text-sm shadow-brand hover:scale-105 active:scale-95 font-gotham uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </div>

      {/* Stat cards — clicáveis, seleção múltipla, card maior = status dominante */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          const count = statusCounts[card.key]
          const isActive = filterStatuses.includes(card.key)
          const isFeatured = card.key === maxStatusKey && count > 0
          return (
            <button
              key={card.key}
              onClick={() => toggleStatus(card.key)}
              className={cn(
                'group relative bg-card rounded-xl border transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden cursor-pointer',
                isFeatured ? 'p-6 gap-4' : 'p-5 gap-3',
                isActive
                  ? cn('scale-[1.02]', card.activeBorder)
                  : cn('border-border shadow-card hover:shadow-elevated', card.hoverBorder),
                isFeatured && !isActive && 'shadow-elevated'
              )}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              {isFeatured && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
              )}
              <div className={cn(
                'rounded-xl flex items-center justify-center transition-all duration-200',
                isFeatured ? 'w-11 h-11' : 'w-9 h-9',
                card.iconBg
              )}>
                <Icon className={cn(isFeatured ? 'w-5 h-5' : 'w-4 h-4', card.iconColor)} />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest font-gotham">{card.label}</p>
                <p className={cn(
                  'font-gotham font-black text-foreground tabular-nums leading-tight mt-1',
                  isFeatured ? 'text-4xl' : 'text-2xl'
                )}>{count}</p>
              </div>
              {isActive && (
                <span className="text-[10px] text-primary font-bold font-gotham uppercase">✓ Ativo</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Barra de filtros unificada */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-0 rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">

          {/* Botão de status */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-gotham uppercase tracking-wide transition-all duration-150 border-r border-border/60',
              filtersOpen || filterStatuses.length > 0
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Status
            {filterStatuses.length > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {filterStatuses.length}
              </span>
            )}
            <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', filtersOpen && 'rotate-180')} />
          </button>

          {/* Separador visual */}
          <div className="flex items-center px-1">
            <DatePickerFilter value={filterData} onChange={setDate} />
          </div>

          {/* Limpar tudo */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:text-red-500 transition-all border-l border-border/60 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        {/* Painel de status — oculto por padrão */}
        {filtersOpen && (
          <div className="flex flex-wrap justify-center gap-1.5 rounded-xl bg-muted/60 px-3 py-2 border border-border/50 animate-fade-up">
            {STATUS_OPTIONS.map(o => {
              const isActive = filterStatuses.includes(o.value)
              return (
                <button
                  key={o.value}
                  onClick={() => toggleStatus(o.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 hover:scale-105 font-gotham uppercase',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                  )}
                >
                  {o.label}
                  {isActive && ' ✓'}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Contador de resultados filtrados */}
      {activeFiltersCount > 0 && (
        <p className="text-center text-xs text-muted-foreground -mt-2">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          {filterStatuses.length > 0 && ` · ${filterStatuses.map(s => STATUS_OPTIONS.find(o => o.value === s)?.label).join(', ')}`}
          {filterData && ` · ${format(new Date(filterData + 'T12:00:00'), 'dd/MM/yyyy')}`}
        </p>
      )}

      {/* Tabela */}
      <AgendamentosTable
        agendamentos={paginated}
        hasFilters={activeFiltersCount > 0}
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        onPage={setPage}
        onEdit={a => { setEditingAgendamento(a); setSheetOpen(true) }}
        compact={compact}
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
