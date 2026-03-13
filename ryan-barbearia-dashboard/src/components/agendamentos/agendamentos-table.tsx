'use client'

import { useRouter } from 'next/navigation'
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
}

export function AgendamentosTable({ agendamentos, hasFilters, page, totalPages, total, onPage, onEdit }: AgendamentosTableProps) {
  const router = useRouter()

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
    <div className="bg-card rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-card overflow-hidden">
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
                <tr key={a.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3.5 text-sm font-medium text-foreground whitespace-nowrap tabular-nums">{formatarDataHora(a.data_hora)}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-foreground leading-tight">{a.clientes?.nome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.clientes?.telefone}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-foreground">{a.servicos?.nome}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-foreground tabular-nums">{formatarMoeda(a.servicos?.preco ?? 0)}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border', STATUS_COLORS[a.status])}>
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
