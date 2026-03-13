import { createClient } from '@/lib/supabase/server'
import { CalendarioPageClient } from './calendario-client'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

interface CalendarioPageProps {
  searchParams: Promise<{ mes?: string; semana?: string; view?: string }>
}

export default async function CalendarioPage({ searchParams }: CalendarioPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const view = params.view ?? 'semana'
  const hoje = new Date()

  let dataInicio: Date
  let dataFim: Date

  if (view === 'mes') {
    const mesRef = params.mes ? new Date(params.mes + '-01') : hoje
    dataInicio = startOfMonth(mesRef)
    dataFim = endOfMonth(mesRef)
  } else {
    const semanaRef = params.semana ? new Date(params.semana) : hoje
    dataInicio = startOfWeek(semanaRef, { weekStartsOn: 0 })
    dataFim = endOfWeek(semanaRef, { weekStartsOn: 0 })
  }

  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select(`
      *,
      clientes (id, nome, telefone),
      servicos (id, nome, duracao_minutos, preco)
    `)
    .gte('data_hora', dataInicio.toISOString())
    .lte('data_hora', dataFim.toISOString())
    .not('status', 'eq', 'cancelado')
    .order('data_hora', { ascending: true })

  return (
    <CalendarioPageClient
      agendamentos={(agendamentos ?? []) as AgendamentoComRelacoes[]}
      view={view as 'semana' | 'mes'}
      dataInicioStr={dataInicio.toISOString()}
      dataFimStr={dataFim.toISOString()}
    />
  )
}
