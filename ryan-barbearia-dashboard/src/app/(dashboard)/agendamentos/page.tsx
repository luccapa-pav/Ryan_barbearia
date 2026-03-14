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

  const [agendamentosRes, servicosRes] = await Promise.all([
    supabase
      .from('agendamentos')
      .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
      .order('data_hora', { ascending: false })
      .limit(500),
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
