import { createClient } from '@/lib/supabase/server'
import { CalendarioClient } from './calendario-client'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const revalidate = 3600

export default async function CalendarioPage() {
  const supabase = await createClient()

  // Busca o ano corrente completo (com buffer de 1 mês em cada lado)
  const now  = new Date()
  const from = new Date(now.getFullYear(), 0, 1)           // Jan 1
  const to   = new Date(now.getFullYear(), 11, 31, 23, 59, 59) // Dec 31

  const { data } = await supabase
    .from('agendamentos')
    .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
    .gte('data_hora', from.toISOString())
    .lte('data_hora', to.toISOString())
    .order('data_hora', { ascending: true })

  return (
    <CalendarioClient agendamentos={(data ?? []) as AgendamentoComRelacoes[]} />
  )
}
