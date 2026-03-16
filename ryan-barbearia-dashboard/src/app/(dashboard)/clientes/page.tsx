import { createClient } from '@/lib/supabase/server'
import { ClientesPageClient } from './clientes-client'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const revalidate = 60

export default async function ClientesPage() {
  const supabase = await createClient()

  const [clientesResult, agendResult, crmResult] = await Promise.all([
    supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true }),
    supabase
      .from('agendamentos')
      .select('id, cliente_id, status, data_hora, servicos (id, nome, preco)')
      .gte('data_hora', new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('data_hora', { ascending: false })
      .limit(2000),
    supabase
      .from('ryan_gomes_barbearia')
      .select('whatsapp, quantidade_cortes, gasto_total, servico_habitual, resumo_perfil_cliente'),
  ])

  if (clientesResult.error) console.error('[clientes/page] clientes:', clientesResult.error.message)
  if (agendResult.error) console.error('[clientes/page] agendamentos:', agendResult.error.message)
  if (crmResult.error) console.error('[clientes/page] crm:', crmResult.error.message)

  return (
    <ClientesPageClient
      clientes={clientesResult.data ?? []}
      agendamentos={(agendResult.data ?? []) as unknown as AgendamentoComRelacoes[]}
      crmData={crmResult.data ?? []}
    />
  )
}
