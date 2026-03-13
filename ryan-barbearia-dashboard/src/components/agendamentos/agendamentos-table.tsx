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

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'pagina') params.delete('pagina')
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handleCancelar(id: string) {
    const result = await cancelarAgendamento(id)
    if (result.success) {
      toast.success('Agendamento cancelado')
      router.refresh()
    } else {
      toast.error(result.error ?? 'Erro ao cancelar')
    }
  }

  async function handleConcluir(id: string) {
    const result = await concluirAgendamento(id)
    if (result.success) {
      toast.success('Agendamento marcado como concluído')
      router.refresh()
    } else {
      toast.error(result.error ?? 'Erro ao concluir')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={searchParams.get('status') ?? ''}
          onChange={(e) => updateParam('status', e.target.value)}
          className="px-3 py-2 rounded-md bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={searchParams.get('data') ?? ''}
          onChange={(e) => updateParam('data', e.target.value)}
          className="px-3 py-2 rounded-md bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />

        {(searchParams.get('status') || searchParams.get('data')) && (
          <button
            onClick={() => router.push(pathname)}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Origem
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agendamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                agendamentos.map((agendamento) => (
                  <tr key={agendamento.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                      {formatarDataHora(agendamento.data_hora)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-foreground">{agendamento.clientes?.nome}</div>
                      <div className="text-xs text-muted-foreground">{agendamento.clientes?.telefone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {agendamento.servicos?.nome}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {formatarMoeda(agendamento.servicos?.preco ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                        STATUS_COLORS[agendamento.status]
                      )}>
                        {STATUS_LABELS[agendamento.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {ORIGEM_LABELS[agendamento.origem] ?? agendamento.origem}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => onEdit(agendamento)}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {(agendamento.status === 'pendente' || agendamento.status === 'confirmado') && (
                          <>
                            <button
                              onClick={() => handleConcluir(agendamento.id)}
                              className="p-1.5 rounded text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors"
                              title="Marcar como concluído"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCancelar(agendamento.id)}
                              className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Cancelar"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {pagina} de {totalPages} · {total} agendamentos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => updateParam('pagina', String(pagina - 1))}
                disabled={pagina <= 1}
                className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateParam('pagina', String(pagina + 1))}
                disabled={pagina >= totalPages}
                className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
