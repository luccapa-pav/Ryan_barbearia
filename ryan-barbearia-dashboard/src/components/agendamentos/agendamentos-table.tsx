'use client'

import { useState } from 'react'
import { Edit, CheckCircle, XCircle, ChevronLeft, ChevronRight, CalendarOff } from 'lucide-react'
import { cn, formatarDataHora, formatarMoeda, STATUS_LABELS, STATUS_COLORS, ORIGEM_LABELS } from '@/lib/utils'
import { cancelarAgendamento, concluirAgendamento } from '@/actions/agendamentos'
import { toast } from 'sonner'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

interface AgendamentosTableProps {
  agendamentos: AgendamentoComRelacoes[]
  hasFilters: boolean
  page: number
  totalPages: number
  total: number
  onPage: (p: number) => void
  onEdit: (a: AgendamentoComRelacoes) => void
  compact?: boolean
}

export function AgendamentosTable({ agendamentos, hasFilters, page, totalPages, total, onPage, onEdit, compact = false }: AgendamentosTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  function handleCancelar(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setLoadingId(id)
    let undone = false
    const timer = setTimeout(async () => {
      if (undone) return
      const r = await cancelarAgendamento(id)
      if (!r.success) toast.error(r.error ?? 'Erro ao cancelar')
      setLoadingId(null)
    }, 5000)
    toast.error('Agendamento cancelado', {
      description: 'O status será atualizado para Cancelado.',
      duration: 5000,
      action: {
        label: 'Desfazer',
        onClick: () => {
          undone = true
          clearTimeout(timer)
          setLoadingId(null)
          toast.success('Ação desfeita')
        },
      },
    })
  }

  function handleConcluir(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setLoadingId(id)
    let undone = false
    const timer = setTimeout(async () => {
      if (undone) return
      const r = await concluirAgendamento(id)
      if (!r.success) toast.error(r.error ?? 'Erro ao concluir')
      setLoadingId(null)
    }, 5000)
    toast.success('Agendamento concluído!', {
      description: 'O status será atualizado para Concluído.',
      duration: 5000,
      action: {
        label: 'Desfazer',
        onClick: () => {
          undone = true
          clearTimeout(timer)
          setLoadingId(null)
          toast.success('Ação desfeita')
        },
      },
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      {agendamentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <CalendarOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground text-sm">Nenhum agendamento encontrado</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {hasFilters ? 'Tente remover os filtros.' : 'Os agendamentos aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Data/Hora', 'Cliente', 'Serviço', 'Valor', 'Status', 'Origem', ''].map((h, i) => (
                  <th key={i} className={cn(
                    'px-4 py-3 text-[11px] font-extrabold text-primary uppercase tracking-widest font-gotham',
                    i < 6 ? 'text-left' : 'w-24'
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agendamentos.map(a => (
                <tr
                  key={a.id}
                  onClick={() => onEdit(a)}
                  className="hover:bg-muted/40 transition-colors group cursor-pointer"
                >
                  <td className={cn('px-4 text-sm font-medium text-foreground whitespace-nowrap tabular-nums', compact ? 'py-2' : 'py-3.5')}>{formatarDataHora(a.data_hora)}</td>
                  <td className={cn('px-4', compact ? 'py-2' : 'py-3.5')}>
                    <p className="text-sm font-semibold text-foreground leading-tight">{a.clientes?.nome}</p>
                    {!compact && <p className="text-xs text-muted-foreground mt-0.5">{a.clientes?.telefone}</p>}
                  </td>
                  <td className={cn('px-4 text-sm text-foreground', compact ? 'py-2' : 'py-3.5')}>{a.servicos?.nome}</td>
                  <td className={cn('px-4 text-sm font-bold text-foreground tabular-nums', compact ? 'py-2' : 'py-3.5')}>{formatarMoeda(a.servicos?.preco ?? 0)}</td>
                  <td className={cn('px-4 w-28', compact ? 'py-2' : 'py-3.5')}>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap', STATUS_COLORS[a.status])}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className={cn('px-4 text-xs text-muted-foreground', compact ? 'py-2' : 'py-3.5')}>{ORIGEM_LABELS[a.origem] ?? a.origem}</td>
                  <td className={cn('px-4', compact ? 'py-2' : 'py-3.5')} onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); onEdit(a) }}
                        disabled={loadingId === a.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {(a.status === 'pendente' || a.status === 'confirmado') && (
                        <>
                          <button
                            onClick={e => handleConcluir(e, a.id)}
                            disabled={loadingId === a.id}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-40"
                            title="Concluir"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleCancelar(e, a.id)}
                            disabled={loadingId === a.id}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                            title="Cancelar"
                          >
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
            Página {page} de {totalPages} · <span className="font-semibold text-foreground">{total}</span> resultados
          </p>
          <div className="flex gap-1">
            <button onClick={() => onPage(page - 1)} disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
