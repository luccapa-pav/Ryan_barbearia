'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { AgendamentoCard } from './agendamento-card'
import { CalendarOff, Plus } from 'lucide-react'
import Link from 'next/link'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

interface TimelineHojeProps {
  agendamentosIniciais: AgendamentoComRelacoes[]
  hojeStr: string
}

export function TimelineHoje({ agendamentosIniciais, hojeStr }: TimelineHojeProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComRelacoes[]>(agendamentosIniciais)
  const originalTitle = useRef<string>('')

  useEffect(() => {
    originalTitle.current = document.title
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('agendamentos-hoje')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'agendamentos',
        filter: `data_hora=gte.${hojeStr}T00:00:00`,
      }, async (payload) => {
        const amanha = new Date(hojeStr)
        amanha.setDate(amanha.getDate() + 1)
        const { data } = await supabase
          .from('agendamentos')
          .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
          .gte('data_hora', `${hojeStr}T00:00:00`)
          .lt('data_hora', `${amanha.toISOString().split('T')[0]}T00:00:00`)
          .not('status', 'eq', 'cancelado')
          .order('data_hora', { ascending: true })
        if (data) {
          setAgendamentos(data as AgendamentoComRelacoes[])

          // Flash na aba do navegador apenas para novos agendamentos
          if (payload.eventType === 'INSERT') {
            const base = originalTitle.current || document.title
            let i = 0
            const iv = setInterval(() => {
              document.title = i++ % 2 === 0 ? '🔔 Novo agendamento!' : base
              if (i >= 8) { clearInterval(iv); document.title = base }
            }, 500)
            toast.success('Novo agendamento!', {
              description: 'A agenda foi atualizada.',
              duration: 4000,
            })
          } else {
            toast.info('Agenda atualizada', { duration: 3000 })
          }
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [hojeStr])

  if (agendamentos.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <CalendarOff className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Nenhum agendamento hoje</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Novos agendamentos via WhatsApp aparecerão aqui automaticamente.
          </p>
        </div>
        <Link
          href="/agendamentos?novo=1"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-brand"
        >
          <Plus className="w-4 h-4" />
          Novo agendamento
        </Link>
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
