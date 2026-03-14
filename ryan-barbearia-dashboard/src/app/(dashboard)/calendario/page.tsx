import { createClient } from '@/lib/supabase/server'
import { CalendarioClient } from './calendario-client'
import type { AgendamentoComRelacoes, HorarioTrabalho } from '@/lib/supabase/types'

export const revalidate = 3600

export default async function CalendarioPage() {
  const supabase = await createClient()

  const now  = new Date()
  const from = new Date(now.getFullYear(), 0, 1)
  const to   = new Date(now.getFullYear(), 11, 31, 23, 59, 59)

  const [agendResult, horariosResult] = await Promise.all([
    supabase
      .from('agendamentos')
      .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
      .gte('data_hora', from.toISOString())
      .lte('data_hora', to.toISOString())
      .order('data_hora', { ascending: true }),
    supabase
      .from('horarios_trabalho')
      .select('id, dia_semana, hora_inicio, hora_fim, ativo')
      .eq('ativo', true),
  ])

  return (
    <CalendarioClient
      agendamentos={(agendResult.data ?? []) as AgendamentoComRelacoes[]}
      horarios={(horariosResult.data ?? []) as HorarioTrabalho[]}
    />
  )
}
