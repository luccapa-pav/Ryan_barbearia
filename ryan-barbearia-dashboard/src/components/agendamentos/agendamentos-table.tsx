'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Edit, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatarDataHora, formatarMoeda, STATUS_LABELS, STATUS_COLORS, ORIGEM_LABELS } from '@/lib/utils'
import { cancelarAgendamento, concluirAgendamento } from '@/actions/agendamentos'
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
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'faltou', label: 'Faltou' },
]

export function AgendamentosTable({ agendamentos, total, pagina, pageSize, onEdit }: AgendamentosTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    if (key !== 'pagina') params.delete('pagina')
    router.push(`${pathname}?${params.toString()}`)
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
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={searchParams.get('status') ?? ''}
          onChange={e => updateParam('status', e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="date"
          value={searchParams.get('data') ?? ''}
          onChange={e => updateParam('data', e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
        />
        {(searchParams.get('status') || searchParams.get('data')) && (
          <button onClick={() => router.push(pathname)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Data/Hora</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Serviço</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Origem</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agendamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : agendamentos.map(a => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm text-foreground whitespace-nowrap">{formatarDataHora(a.data_hora)}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-foreground">{a.clientes?.nome}</p>
                    <p className="text-xs text-muted-foreground">{a.clientes?.telefone}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-foreground">{a.servicos?.nome}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-foreground">{formatarMoeda(a.servicos?.preco ?? 0)}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border', STATUS_COLORS[a.status])}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground">{ORIGEM_LABELS[a.origem] ?? a.origem}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Editar">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {(a.status === 'pendente' || a.status === 'confirmado') && <>
                        <button onClick={() => handleConcluir(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Concluir">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleCancelar(a.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors" title="Cancelar">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">Página {pagina} de {totalPages} · {total} registros</p>
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
