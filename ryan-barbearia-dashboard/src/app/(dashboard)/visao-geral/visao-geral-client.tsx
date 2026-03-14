'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarCheck, CheckCircle } from 'lucide-react'
import { FiltroPeriodo } from '@/components/visao-geral/filtro-periodo'
import { MetricasAgendamentos } from '@/components/visao-geral/metricas-agendamentos'
import { MetricasWhatsapp } from '@/components/visao-geral/metricas-whatsapp'
import { GraficoStatus } from '@/components/visao-geral/grafico-pico'
import { UltimaAtualizacao } from '@/components/visao-geral/ultima-atualizacao'
import { TimelineHoje } from '@/components/hoje/timeline'
import { formatarHora } from '@/lib/utils'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

const STORAGE_KEY = 'ryan-dashboard-periodo'

type Periodo = 'hoje' | 'semana' | 'mes'

interface VisaoGeralClientProps {
  todosAgendamentos: AgendamentoComRelacoes[]
  todosLeads: { status: string | null; timestamp_ultima_msg: string | null; servicos: string | null; inicio_fora_horario_comercial: string | null }[]
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
  const [periodo, setPeriodo] = useState<Periodo>('hoje')

  // Lê localStorage após hydration para evitar mismatch SSR/client
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'hoje' || saved === 'semana' || saved === 'mes') setPeriodo(saved)
  }, [])

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

      {/* Banner: Resumo do dia — só aparece no período "hoje" */}
      {periodo === 'hoje' && agendamentos.length > 0 && (
        <ResumoDia agendamentos={agendamentos} concluidos={concluidos} />
      )}

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

// ── Resumo do dia ─────────────────────────────────────────────────────────────

function ResumoDia({ agendamentos, concluidos }: { agendamentos: AgendamentoComRelacoes[]; concluidos: number }) {
  const now = new Date()
  const total = agendamentos.filter(a => a.status !== 'cancelado').length
  const proximo = agendamentos
    .filter(a => (a.status === 'pendente' || a.status === 'confirmado') && new Date(a.data_hora) > now)
    .sort((a, b) => a.data_hora.localeCompare(b.data_hora))[0] ?? null

  const pct = total > 0 ? Math.round((concluidos / total) * 100) : 0

  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4 shadow-card overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Ícone */}
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <CalendarCheck className="w-4 h-4 text-primary" />
      </div>

      {/* Próximo */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest font-gotham">
          {proximo ? 'Próximo agendamento' : 'Hoje'}
        </p>
        {proximo ? (
          <p className="text-sm font-semibold text-foreground leading-tight mt-0.5 truncate">
            <span className="text-primary font-gotham font-black">{formatarHora(proximo.data_hora)}</span>
            {' · '}{proximo.clientes?.nome}{' · '}{proximo.servicos?.nome}
          </p>
        ) : (
          <p className="text-sm font-semibold text-muted-foreground mt-0.5">Sem próximos agendamentos</p>
        )}
      </div>

      {/* Progresso */}
      {total > 0 && (
        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-gotham font-black text-foreground tabular-nums leading-none">
              {concluidos}<span className="text-sm text-muted-foreground font-semibold">/{total}</span>
            </p>
            <p className="text-[10px] text-muted-foreground font-gotham uppercase tracking-wide">concluídos</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `conic-gradient(hsl(var(--primary)) ${pct * 3.6}deg, hsl(var(--muted)) 0deg)` }}>
            <div className="w-5 h-5 rounded-full bg-card flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
