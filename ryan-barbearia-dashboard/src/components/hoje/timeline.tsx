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
    const channel = supabase
      .channel('agendamentos-hoje')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'agendamentos',
        filter: `data_hora=gte.${hojeStr}T00:00:00`,
      }, async () => {
        const amanha = new Date(hojeStr)
        amanha.setDate(amanha.getDate() + 1)
        const { data } = await supabase
          .from('agendamentos')
          .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
          .gte('data_hora', `${hojeStr}T00:00:00`)
          .lt('data_hora', `${amanha.toISOString().split('T')[0]}T00:00:00`)
          .not('status', 'eq', 'cancelado')
          .order('data_hora', { ascending: true })
        if (data) setAgendamentos(data as AgendamentoComRelacoes[])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [hojeStr])

  if (agendamentos.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <CalendarOff className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">Nenhum agendamento hoje</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Novos agendamentos via WhatsApp aparecerão aqui automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground text-sm">Agenda do dia</h3>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="divide-y divide-border">
        {agendamentos.map(a => <AgendamentoCard key={a.id} agendamento={a} />)}
      </div>
    </div>
  )
}
