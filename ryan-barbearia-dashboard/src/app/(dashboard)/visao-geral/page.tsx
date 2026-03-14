import { createClient } from '@/lib/supabase/server'
import { VisaoGeralClient } from './visao-geral-client'
import { format } from 'date-fns'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const revalidate = 60

export default async function VisaoGeralPage() {
  const supabase = await createClient()

  // Busca o mês atual completo + 1 semana de buffer em cada lado
  // Isso cobre Hoje, Semana e Mês sem round-trips extras
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  from.setDate(from.getDate() - 7)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  to.setDate(to.getDate() + 7)

  const [agendResult, leadsResult] = await Promise.all([
    supabase
      .from('agendamentos')
      .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
      .gte('data_hora', from.toISOString())
      .lte('data_hora', to.toISOString())
      .order('data_hora', { ascending: true }),
    supabase
      .from('ryan_gomes_barbearia')
      .select('status, timestamp_ultima_msg, servicos, inicio_fora_horario_comercial')
      .gte('timestamp_ultima_msg', from.toISOString())
      .lte('timestamp_ultima_msg', to.toISOString()),
  ])

  const agendamentos = (agendResult.data ?? []) as AgendamentoComRelacoes[]
  const leads        = leadsResult.data ?? []
  const hojeStr      = format(now, 'yyyy-MM-dd')

  return (
    <VisaoGeralClient
      todosAgendamentos={agendamentos}
      todosLeads={leads}
      hojeStr={hojeStr}
    />
  )
}
