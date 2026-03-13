import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FiltroPeriodo } from '@/components/visao-geral/filtro-periodo'
import { MetricasAgendamentos } from '@/components/visao-geral/metricas-agendamentos'
import { MetricasWhatsapp } from '@/components/visao-geral/metricas-whatsapp'
import { GraficoStatus } from '@/components/visao-geral/grafico-pico'
import { TimelineHoje } from '@/components/hoje/timeline'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const revalidate = 30

interface SearchParams {
  periodo?: string
  de?: string
  ate?: string
}

function getPeriodRange(params: SearchParams): { from: string; to: string; label: string } {
  const now = new Date()

  if (params.de && params.ate) {
    return {
      from: `${params.de}T00:00:00`,
      to: `${params.ate}T23:59:59`,
      label: `${params.de} → ${params.ate}`,
    }
  }

  const periodo = params.periodo ?? 'hoje'

  if (periodo === 'semana') {
    const day = now.getDay()
    const diffMonday = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffMonday)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return { from: monday.toISOString(), to: sunday.toISOString(), label: 'Esta semana' }
  }

  if (periodo === 'mes') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    return {
      from: first.toISOString(),
      to: last.toISOString(),
      label: format(now, 'MMMM yyyy', { locale: ptBR }),
    }
  }

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return {
    from: start.toISOString(),
    to: end.toISOString(),
    label: format(now, "EEEE',' dd 'de' MMMM", { locale: ptBR }),
  }
}

export default async function VisaoGeralPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { from, to, label } = getPeriodRange(searchParams)
  const periodo = searchParams.periodo ?? 'hoje'
  const isHoje = periodo === 'hoje' && !searchParams.de

  // Queries em paralelo
  const [agendResult, leadsResult] = await Promise.all([
    supabase
      .from('agendamentos')
      .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
      .gte('data_hora', from)
      .lte('data_hora', to)
      .neq('status', 'cancelado')
      .order('data_hora', { ascending: true }),
    supabase
      .from('ryan_gomes_barbearia')
      .select('status, timestamp_ultima_msg, servicos')
      .gte('timestamp_ultima_msg', from)
      .lte('timestamp_ultima_msg', to),
  ])

  const agendamentos = (agendResult.data ?? []) as AgendamentoComRelacoes[]
  const leads        = leadsResult.data ?? []

  const receita    = agendamentos.reduce((s, a) => s + (a.servicos?.preco ?? 0), 0)
  const concluidos = agendamentos.filter(a => a.status === 'concluido').length
  const hojeStr    = format(new Date(), 'yyyy-MM-dd')

  const labelCapitalizado = label.charAt(0).toUpperCase() + label.slice(1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
            {labelCapitalizado}
          </p>
          <h2 className="text-2xl font-display font-bold text-foreground">Visão Geral</h2>
        </div>
        <Suspense fallback={null}>
          <FiltroPeriodo />
        </Suspense>
      </div>

      <MetricasAgendamentos
        total={agendamentos.length}
        receita={receita}
        concluidos={concluidos}
      />

      <MetricasWhatsapp leads={leads} />

      <GraficoStatus leads={leads} />

      {isHoje && (
        <TimelineHoje
          agendamentosIniciais={agendamentos}
          hojeStr={hojeStr}
        />
      )}
    </div>
  )
}
