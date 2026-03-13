'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { AgendamentoSheet } from '@/components/agendamentos/agendamento-sheet'
import { AgendamentosTable } from '@/components/agendamentos/agendamentos-table'
import { DatePickerFilter } from '@/components/agendamentos/date-picker-filter'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { AgendamentoComRelacoes, Servico } from '@/lib/supabase/types'
import { Clock, CheckCircle, CalendarCheck, XCircle } from 'lucide-react'

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: 'pendente',   label: 'Pendente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado',  label: 'Cancelado' },
  { value: 'concluido',  label: 'Concluído' },
  { value: 'faltou',     label: 'Faltou' },
]

const STAT_CARDS = [
  { key: 'pendente',   label: 'Pendentes',   icon: Clock,         iconBg: 'bg-amber-100  dark:bg-amber-950/40',  iconColor: 'text-amber-600  dark:text-amber-400',  border: 'hover:border-amber-400'   },
  { key: 'confirmado', label: 'Confirmados', icon: CalendarCheck, iconBg: 'bg-emerald-100 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-400' },
  { key: 'concluido',  label: 'Concluídos',  icon: CheckCircle,   iconBg: 'bg-blue-100   dark:bg-blue-950/40',   iconColor: 'text-blue-600   dark:text-blue-400',   border: 'hover:border-blue-400'    },
  { key: 'cancelado',  label: 'Cancelados',  icon: XCircle,       iconBg: 'bg-red-100    dark:bg-red-950/40',    iconColor: 'text-red-500    dark:text-red-400',    border: 'hover:border-red-400'     },
] as const

interface AgendamentosPageClientProps {
  agendamentos: AgendamentoComRelacoes[]
  servicos: Servico[]
}

export function AgendamentosPageClient({ agendamentos, servicos }: AgendamentosPageClientProps) {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterData, setFilterData] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState<AgendamentoComRelacoes | null>(null)
  const router = useRouter()

  // Contagens totais (sempre do conjunto completo)
  const statusCounts = useMemo(() => ({
    pendente:   agendamentos.filter(a => a.status === 'pendente').length,
    confirmado: agendamentos.filter(a => a.status === 'confirmado').length,
    concluido:  agendamentos.filter(a => a.status === 'concluido').length,
    cancelado:  agendamentos.filter(a => a.status === 'cancelado').length,
  }), [agendamentos])

  // Filtro client-side — INSTANTÂNEO
  const filtered = useMemo(() => {
    return agendamentos.filter(a => {
      if (filterStatus && a.status !== filterStatus) return false
      if (filterData) {
        const dataHora = a.data_hora.slice(0, 10)
        if (dataHora !== filterData) return false
      }
      return true
    })
  }, [agendamentos, filterStatus, filterData])

  // Paginação client-side
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeFiltersCount = (filterStatus ? 1 : 0) + (filterData ? 1 : 0)

  function toggleStatus(status: string) {
    setFilterStatus(s => s === status ? '' : status)
    setPage(1)
  }

  function setDate(v: string) {
    setFilterData(v)
    setPage(1)
  }

  function clearAll() {
    setFilterStatus('')
    setFilterData('')
    setFiltersOpen(false)
    setPage(1)
  }

  function handleEdit(a: AgendamentoComRelacoes) {
    setEditingAgendamento(a)
    setSheetOpen(true)
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
        <button
          onClick={() => { setEditingAgendamento(null); setSheetOpen(true) }}
          className="absolute right-0 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-200 text-sm shadow-brand hover:scale-105 active:scale-95 font-gotham uppercase tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo</span>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          const count = statusCounts[card.key]
          const isActive = filterStatus === card.key
          return (
            <button
              key={card.key}
              onClick={() => toggleStatus(card.key)}
              className={cn(
                'group relative bg-card rounded-xl border shadow-card hover:shadow-elevated transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-3 overflow-hidden cursor-pointer',
                isActive ? 'border-primary shadow-brand scale-[1.02]' : cn('border-zinc-300 dark:border-zinc-600', card.border)
              )}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200', card.iconBg)}>
                <Icon className={cn('w-4 h-4', card.iconColor)} />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest font-gotham">{card.label}</p>
                <p className="text-2xl font-gotham font-black text-foreground tabular-nums leading-tight mt-1">{count}</p>
              </div>
              {isActive && <span className="text-[10px] text-primary font-semibold">Filtrado ✓</span>}
            </button>
          )
        })}
      </div>

      {/* Barra de filtros — data sempre visível, status oculto até clicar */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {/* Botão de filtros de status */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-gotham uppercase tracking-wide transition-all duration-150 hover:scale-105 active:scale-95 border',
              filtersOpen || filterStatus
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-muted/60 border-border/50 text-muted-foreground hover:text-foreground hover:bg-card/80'
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-white/20 text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', filtersOpen && 'rotate-180')} />
          </button>

          {/* Date picker — sempre visível */}
          <DatePickerFilter value={filterData} onChange={setDate} />

          {/* Limpar */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all border border-border/50"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        {/* Painel de status — aparece só quando filtersOpen */}
        {filtersOpen && (
          <div className="flex flex-wrap justify-center gap-1.5 rounded-xl bg-muted/60 px-3 py-2 border border-border/50 animate-fade-up">
            {STATUS_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => toggleStatus(o.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 hover:scale-105 font-gotham uppercase',
                  filterStatus === o.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultado */}
      {(filterStatus || filterData) && (
        <p className="text-center text-xs text-muted-foreground -mt-2">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          {filterData && ` para ${format(new Date(filterData + 'T12:00:00'), 'dd/MM/yyyy')}`}
        </p>
      )}

      <AgendamentosTable
        agendamentos={paginated}
        hasFilters={!!(filterStatus || filterData)}
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        onPage={setPage}
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
