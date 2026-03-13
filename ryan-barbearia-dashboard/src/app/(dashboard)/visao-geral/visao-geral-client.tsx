'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FiltroPeriodo } from '@/components/visao-geral/filtro-periodo'
import { MetricasAgendamentos } from '@/components/visao-geral/metricas-agendamentos'
import { MetricasWhatsapp } from '@/components/visao-geral/metricas-whatsapp'
import { GraficoStatus } from '@/components/visao-geral/grafico-pico'
import { UltimaAtualizacao } from '@/components/visao-geral/ultima-atualizacao'
import { TimelineHoje } from '@/components/hoje/timeline'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

const STORAGE_KEY = 'ryan-dashboard-periodo'

type Periodo = 'hoje' | 'semana' | 'mes'

interface VisaoGeralClientProps {
  todosAgendamentos: AgendamentoComRelacoes[]
  todosLeads: { status: string | null; timestamp_ultima_msg: string | null; servicos: string | null }[]
  hojeStr: string
}

function getPeriodRange(periodo: Periodo): { from: Date; to: Date; label: string } {
  const now = new Date()

  if (periodo === 'semana') {
    const from = startOfWeek(now, { weekStartsOn: 1 }) // segunda
    const to   = endOfWeek(now, { weekStartsOn: 1 })
    return { from, to, label: 'Esta semana' }
  }

  if (periodo === 'mes') {
    const from = startOfMonth(now)
    const to   = endOfMonth(now)
    return { from, to, label: format(now, 'MMMM yyyy', { locale: ptBR }) }
  }

  // hoje
  const from = new Date(now); from.setHours(0, 0, 0, 0)
  const to   = new Date(now); to.setHours(23, 59, 59, 999)
  return {
    from,
    to,
    label: format(now, "EEEE',' dd 'de' MMMM", { locale: ptBR }),
  }
}

export function VisaoGeralClient({ todosAgendamentos, todosLeads, hojeStr }: VisaoGeralClientProps) {
  const [periodo, setPeriodo] = useState<Periodo>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'hoje' || saved === 'semana' || saved === 'mes') return saved
    }
    return 'hoje'
  })

  // Ouve atalho de teclado do KeyboardShortcuts
  useEffect(() => {
    function onPeriodo(e: Event) {
      const p = (e as CustomEvent<{ periodo: string }>).detail.periodo as Periodo
      if (p === 'hoje' || p === 'semana' || p === 'mes') {
        setPeriodo(p)
        localStorage.setItem(STORAGE_KEY, p)
      }
    }
    window.addEventListener('visao-geral:periodo', onPeriodo)
    return () => window.removeEventListener('visao-geral:periodo', onPeriodo)
  }, [])

  function handleSetPeriodo(p: string) {
    const valid = p as Periodo
    setPeriodo(valid)
    localStorage.setItem(STORAGE_KEY, valid)
  }

  const { from, to, label } = useMemo(() => getPeriodRange(periodo), [periodo])

  // Filtragem client-side — INSTANTÂNEA
  const agendamentos = useMemo(() =>
    todosAgendamentos.filter(a => {
      const d = new Date(a.data_hora)
      return d >= from && d <= to
    }),
    [todosAgendamentos, from, to]
  )

  const leads = useMemo(() =>
    todosLeads.filter(l => {
      if (!l.timestamp_ultima_msg) return false
      const d = new Date(l.timestamp_ultima_msg)
      return d >= from && d <= to
    }),
    [todosLeads, from, to]
  )

  const receita    = agendamentos.reduce((s, a) => s + (a.servicos?.preco ?? 0), 0)
  const concluidos = agendamentos.filter(a => a.status === 'concluido').length
  const labelCapitalizado = label.charAt(0).toUpperCase() + label.slice(1)

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div>
          <h2 className="text-5xl font-gotham font-black text-foreground tracking-tight">Visão Geral</h2>
          <p className="text-base font-semibold text-muted-foreground capitalize tracking-wide mt-1">
            {labelCapitalizado}
          </p>
        </div>
        <FiltroPeriodo value={periodo} onChange={handleSetPeriodo} />
      </div>

      <MetricasAgendamentos
        total={agendamentos.length}
        receita={receita}
        concluidos={concluidos}
      />

      <MetricasWhatsapp leads={leads} />

      <GraficoStatus leads={leads} />

      <UltimaAtualizacao />

      {periodo === 'hoje' && (
        <TimelineHoje
          agendamentosIniciais={agendamentos}
          hojeStr={hojeStr}
        />
      )}
    </div>
  )
}
