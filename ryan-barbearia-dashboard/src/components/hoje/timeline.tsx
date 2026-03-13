'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AgendamentoCard } from './agendamento-card'
import { CalendarOff } from 'lucide-react'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

interface TimelineHojeProps {
  agendamentosIniciais: AgendamentoComRelacoes[]
  hojeStr: string
}

export function TimelineHoje({ agendamentosIniciais, hojeStr }: TimelineHojeProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComRelacoes[]>(agendamentosIniciais)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to realtime changes for today's appointments
    const channel = supabase
      .channel('agendamentos-hoje')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
          filter: `data_hora=gte.${hojeStr}T00:00:00`,
        },
        async () => {
          // Refetch on any change
          const amanha = new Date(hojeStr)
          amanha.setDate(amanha.getDate() + 1)
          const amanhaStr = amanha.toISOString().split('T')[0]

          const { data } = await supabase
            .from('agendamentos')
            .select(`
              *,
              clientes (id, nome, telefone),
              servicos (id, nome, duracao_minutos, preco)
            `)
            .gte('data_hora', `${hojeStr}T00:00:00`)
            .lt('data_hora', `${amanhaStr}T00:00:00`)
            .not('status', 'eq', 'cancelado')
            .order('data_hora', { ascending: true })

          if (data) {
            setAgendamentos(data as AgendamentoComRelacoes[])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hojeStr])

  if (agendamentos.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <CalendarOff className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">Nenhum agendamento hoje</p>
        <p className="text-sm text-muted-foreground">
          Os agendamentos do dia aparecerão aqui em tempo real.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Agenda do dia</h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="divide-y divide-border">
        {agendamentos.map((agendamento) => (
          <AgendamentoCard key={agendamento.id} agendamento={agendamento} />
        ))}
      </div>
    </div>
  )
}
