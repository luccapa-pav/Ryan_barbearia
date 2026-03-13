'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatarDataHora, formatarMoeda, STATUS_LABELS, STATUS_COLORS, cn } from '@/lib/utils'
import type { Cliente, AgendamentoComRelacoes } from '@/lib/supabase/types'

interface HistoricoClienteProps {
  cliente: Cliente
}

export function HistoricoCliente({ cliente }: HistoricoClienteProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComRelacoes[]>([])
  const [loading, setLoading] = useState(true)
  const [totalGasto, setTotalGasto] = useState(0)

  useEffect(() => {
    async function fetchHistorico() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clientes (id, nome, telefone),
          servicos (id, nome, duracao_minutos, preco)
        `)
        .eq('cliente_id', cliente.id)
        .order('data_hora', { ascending: false })
        .limit(10)

      if (data) {
        const items = data as AgendamentoComRelacoes[]
        setAgendamentos(items)
        const total = items
          .filter(a => a.status === 'concluido')
          .reduce((sum, a) => sum + (a.servicos?.preco ?? 0), 0)
        setTotalGasto(total)
      }
      setLoading(false)
    }

    fetchHistorico()
  }, [cliente.id])

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Client header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-amber-500">
              {cliente.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{cliente.nome}</p>
            <p className="text-xs text-muted-foreground">{cliente.telefone}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total gasto</span>
            <span className="font-semibold text-green-400">{formatarMoeda(totalGasto)}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">Visitas concluídas</span>
            <span className="font-semibold text-foreground">
              {agendamentos.filter(a => a.status === 'concluido').length}
            </span>
          </div>
        </div>
      </div>

      {/* Historico */}
      <div className="px-5 py-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Histórico recente
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
        ) : agendamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum agendamento encontrado
          </p>
        ) : (
          <div className="space-y-2">
            {agendamentos.map(a => (
              <div key={a.id} className="py-2 border-b border-border/50 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.servicos?.nome}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatarDataHora(a.data_hora)}
                    </p>
                  </div>
                  <span className={cn(
                    'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border flex-shrink-0',
                    STATUS_COLORS[a.status]
                  )}>
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cliente.observacoes && (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Observações
          </p>
          <p className="text-sm text-foreground">{cliente.observacoes}</p>
        </div>
      )}
    </div>
  )
}
