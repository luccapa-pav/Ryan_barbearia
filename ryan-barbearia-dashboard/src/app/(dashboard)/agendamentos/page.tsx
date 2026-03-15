import { createClient } from '@/lib/supabase/server'
import { AgendamentosPageClient } from './agendamentos-client'
import type { AgendamentoComRelacoes, Servico } from '@/lib/supabase/types'

export const revalidate = 30

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>
}) {
  const supabase = await createClient()
  const { novo } = await searchParams

  // Janela de 6 meses atrás até 3 meses à frente — evita truncar histórico silenciosamente
  const now = new Date()
  const from = new Date(now); from.setMonth(from.getMonth() - 6)
  const to   = new Date(now); to.setMonth(to.getMonth() + 3)

  const [agendamentosRes, servicosRes] = await Promise.all([
    supabase
      .from('agendamentos')
      .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
      .gte('data_hora', from.toISOString())
      .lte('data_hora', to.toISOString())
      .order('data_hora', { ascending: false })
      .limit(1000),
    supabase.from('servicos').select('*').eq('ativo', true).order('nome'),
  ])

  return (
    <AgendamentosPageClient
      agendamentos={(agendamentosRes.data ?? []) as AgendamentoComRelacoes[]}
      servicos={(servicosRes.data ?? []) as Servico[]}
      autoOpenSheet={novo === '1'}
    />
  )
}
