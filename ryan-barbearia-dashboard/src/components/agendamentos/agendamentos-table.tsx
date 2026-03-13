'use client'

import { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Edit, CheckCircle, XCircle, ChevronLeft, ChevronRight, CalendarOff, X } from 'lucide-react'
import { cn, formatarDataHora, formatarMoeda, STATUS_LABELS, STATUS_COLORS, ORIGEM_LABELS } from '@/lib/utils'
import { cancelarAgendamento, concluirAgendamento } from '@/actions/agendamentos'
import { DatePickerFilter } from './date-picker-filter'
import { toast } from 'sonner'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

interface AgendamentosTableProps {
  agendamentos: AgendamentoComRelacoes[]
  total: number
  pagina: number
  pageSize: number
  onEdit: (agendamento: AgendamentoComRelacoes) => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendente',   label: 'Pendente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado',  label: 'Cancelado' },
  { value: 'concluido',  label: 'Concluído' },
  { value: 'faltou',     label: 'Faltou' },
]

export function AgendamentosTable({ agendamentos, total, pagina, pageSize, onEdit }: AgendamentosTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const totalPages = Math.ceil(total / pageSize)

  const activeStatus = searchParams.get('status') ?? ''
  const activeData   = searchParams.get('data') ?? ''
  const hasFilters   = !!(activeStatus || activeData)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key !== 'pagina') params.delete('pagina')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  async function handleCancelar(id: string) {
    const r = await cancelarAgendamento(id)
    r.success ? toast.success('Agendamento cancelado') : toast.error(r.error ?? 'Erro ao cancelar')
    router.refresh()
  }

  async function handleConcluir(id: string) {
    const r = await concluirAgendamento(id)
    r.success ? toast.success('Marcado como concluído') : toast.error(r.error ?? 'Erro')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filtros — centralizados */}
      <div className={cn(
        'flex flex-wrap items-center justify-center gap-2 transition-opacity duration-200',
        isPending && 'opacity-60 pointer-events-none'
      )}>
        {/* Status pills */}
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border/50">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => updateParam('status', o.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 hover:scale-105 font-gotham uppercase whitespace-nowrap',
                activeStatus === o.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Date picker customizado */}
        <DatePickerFilter
          value={activeData}
          onChange={v => updateParam('data', v)}
          disabled={isPending}
        />

        {hasFilters && (
          <button
            onClick={() => startTransition(() => router.push(pathname))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all border border-border/50"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className={cn(
        'bg-card rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-card overflow-hidden transition-opacity duration-200',
        isPending && 'opacity-50'
      )}>
        {agendamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <CalendarOff className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground text-sm">Nenhum agendamento encontrado</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {hasFilters ? 'Tente remover os filtros para ver mais resultados.' : 'Os agendamentos aparecerão aqui.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold text-primary uppercase tracking-widest font-gotham">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold text-primary uppercase tracking-widest font-gotham">Cliente</th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold text-primary uppercase tracking-widest font-gotham">Serviço</th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold text-primary uppercase tracking-widest font-gotham">Valor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold text-primary uppercase tracking-widest font-gotham">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold text-primary uppercase tracking-widest font-gotham">Origem</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agendamentos.map(a => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3.5 text-sm font-medium text-foreground whitespace-nowrap tabular-nums">
                      {formatarDataHora(a.data_hora)}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground leading-tight">{a.clientes?.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.clientes?.telefone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-foreground">{a.servicos?.nome}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-foreground tabular-nums">{formatarMoeda(a.servicos?.preco ?? 0)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                        STATUS_COLORS[a.status]
                      )}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{ORIGEM_LABELS[a.origem] ?? a.origem}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Editar">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {(a.status === 'pendente' || a.status === 'confirmado') && (
                          <>
                            <button onClick={() => handleConcluir(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors" title="Concluir">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleCancelar(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Cancelar">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Página {pagina} de {totalPages} · <span className="font-semibold text-foreground">{total}</span> registros
            </p>
            <div className="flex gap-1">
              <button onClick={() => updateParam('pagina', String(pagina - 1))} disabled={pagina <= 1}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => updateParam('pagina', String(pagina + 1))} disabled={pagina >= totalPages}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
